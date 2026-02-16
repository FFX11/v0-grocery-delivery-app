-- Drop existing objects if needed for clean re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS products_updated_at ON public.products;
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;

DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'superuser');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create categories table
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create products table (GBP - price_in_pence)
CREATE TABLE public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price_in_pence INTEGER NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  image TEXT,
  unit TEXT,
  in_stock BOOLEAN DEFAULT true,
  origin TEXT,
  weight TEXT,
  nutrition_info TEXT,
  storage_instructions TEXT,
  halal_certified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create order status enum
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  delivery_postcode TEXT,
  delivery_option TEXT,
  delivery_fee INTEGER DEFAULT 0,
  subtotal INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status order_status DEFAULT 'pending' NOT NULL,
  stripe_session_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT,
  product_name TEXT NOT NULL,
  product_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superuser'))
  );

CREATE POLICY "profiles_update_superuser" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superuser')
  );

-- Categories policies (public read, admin/superuser write)
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superuser'))
  );

CREATE POLICY "categories_update_admin" ON public.categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superuser'))
  );

CREATE POLICY "categories_delete_superuser" ON public.categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superuser')
  );

-- Products policies (public read, admin/superuser write)
CREATE POLICY "products_select_all" ON public.products
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "products_insert_admin" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superuser'))
  );

CREATE POLICY "products_update_admin" ON public.products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superuser'))
  );

CREATE POLICY "products_delete_admin" ON public.products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superuser'))
  );

-- Orders policies
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_select_admin" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superuser'))
  );

CREATE POLICY "orders_insert_all" ON public.orders
  FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superuser'))
  );

-- Order items policies
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "order_items_select_admin" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superuser'))
  );

CREATE POLICY "order_items_insert_all" ON public.order_items
  FOR INSERT TO authenticated, anon WITH CHECK (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed categories (English + Arabic)
INSERT INTO public.categories (id, name, name_ar, description, description_ar, icon) VALUES
  ('groceries', 'Fresh Groceries', 'بقالة طازجة', 'Fresh fruits, vegetables, and daily essentials', 'فواكه وخضروات طازجة ومستلزمات يومية', 'leaf'),
  ('meat', 'Halal Meat & Poultry', 'لحوم ودواجن حلال', 'Premium HMC certified halal meats and poultry', 'لحوم ودواجن حلال معتمدة من HMC بجودة عالية', 'drumstick'),
  ('pantry', 'Pantry Staples', 'أساسيات المطبخ', 'Beans, grains, canned goods, and more', 'بقوليات وحبوب ومعلبات والمزيد', 'package')
ON CONFLICT (id) DO NOTHING;

-- Seed products (UK GBP pence, halal meat, English + Arabic)
INSERT INTO public.products (id, name, name_ar, description, description_ar, price_in_pence, category_id, image, unit, in_stock, origin, weight, nutrition_info, storage_instructions, halal_certified) VALUES
  ('organic-bananas', 'Organic Bananas', 'موز عضوي', 'Fresh organic bananas, perfect for smoothies or snacking', 'موز عضوي طازج، مثالي للعصائر أو كوجبة خفيفة', 129, 'groceries', '/images/bananas.jpg', 'bunch', true, 'Ecuador / UK Import', '1 kg avg', 'Rich in potassium and fibre', 'Store at room temperature', false),
  ('fresh-tomatoes', 'Vine Tomatoes', 'طماطم على العنقود', 'Vine-ripened tomatoes, perfect for sauces and salads', 'طماطم ناضجة على العنقود، مثالية للصلصات والسلطات', 199, 'groceries', '/images/tomatoes.jpg', 'kg', true, 'UK Grown', '500g', 'High in lycopene and vitamin C', 'Refrigerate after cutting', false),
  ('fresh-spinach', 'Baby Spinach', 'سبانخ صغيرة', 'Tender baby spinach leaves, pre-washed and ready to eat', 'أوراق سبانخ صغيرة طرية، مغسولة وجاهزة للأكل', 150, 'groceries', '/images/spinach.jpg', '200g bag', true, 'UK Grown', '200g', 'Excellent source of iron and vitamins A, C, K', 'Keep refrigerated', false),
  ('red-apples', 'Royal Gala Apples', 'تفاح رويال جالا', 'Sweet and crispy Royal Gala apples', 'تفاح رويال جالا حلو ومقرمش', 75, 'groceries', '/images/apples.jpg', 'each', true, 'UK Grown', '150g avg', 'Good source of fibre and vitamin C', 'Refrigerate for best freshness', false),
  ('fresh-carrots', 'Organic Carrots', 'جزر عضوي', 'Crunchy organic carrots, perfect for snacking or cooking', 'جزر عضوي مقرمش، مثالي كوجبة خفيفة أو للطبخ', 99, 'groceries', '/images/carrots.jpg', '1 kg bag', true, 'UK Grown', '1 kg', 'High in beta-carotene and fibre', 'Keep refrigerated', false),
  ('chicken-breast', 'Halal Chicken Breast', 'صدور دجاج حلال', 'HMC certified boneless, skinless chicken breast. Hand-slaughtered and blessed.', 'صدور دجاج حلال بدون عظم وجلد، مذبوحة يدوياً ومعتمدة من HMC', 599, 'meat', '/images/chicken.jpg', 'kg', true, 'UK HMC Certified', '1 kg', '31g protein per serving', 'Keep frozen or refrigerate and use within 2 days', true),
  ('minced-beef', 'Halal Minced Beef', 'لحم بقري مفروم حلال', 'HMC certified premium minced beef, perfect for kebabs and keema', 'لحم بقري مفروم حلال معتمد من HMC، مثالي للكباب والقيمة', 699, 'meat', '/images/ground-beef.jpg', 'kg', true, 'UK HMC Certified', '500g', '20g protein per serving', 'Keep frozen or refrigerate and use within 2 days', true),
  ('lamb-chops', 'Halal Lamb Chops', 'ريش غنم حلال', 'HMC certified tender lamb chops, ideal for grilling or curries', 'ريش غنم حلال معتمدة من HMC، مثالية للشوي أو الكاري', 899, 'meat', '/images/pork-chops.jpg', 'kg', true, 'UK HMC Certified', '500g', '26g protein per serving', 'Keep frozen or refrigerate and use within 3 days', true),
  ('salmon-fillet', 'Halal Salmon Fillet', 'فيليه سلمون حلال', 'Fresh Scottish salmon fillet, naturally halal and rich in omega-3', 'فيليه سلمون اسكتلندي طازج، حلال طبيعياً وغني بأوميغا 3', 999, 'meat', '/images/salmon.jpg', 'kg', true, 'Scottish HMC Certified', '500g', 'High in omega-3, 25g protein per serving', 'Keep refrigerated and use within 2 days', true),
  ('lamb-leg', 'Halal Leg of Lamb', 'فخذ خروف حلال', 'HMC certified whole leg of lamb, perfect for Sunday roast', 'فخذ خروف حلال كامل معتمد من HMC، مثالي للشوي', 1299, 'meat', '/images/pork-chops.jpg', 'kg', true, 'UK HMC Certified', '2 kg avg', '25g protein per serving', 'Keep frozen or refrigerate and use within 3 days', true),
  ('turkey-breast', 'Halal Turkey Breast', 'صدر ديك رومي حلال', 'HMC certified lean turkey breast, great for healthy meals', 'صدر ديك رومي حلال معتمد من HMC، مثالي للوجبات الصحية', 749, 'meat', '/images/turkey.jpg', 'kg', true, 'UK HMC Certified', '1 kg', '29g protein per serving, low fat', 'Keep frozen or refrigerate and use within 2 days', true),
  ('black-beans', 'Organic Black Beans', 'فاصوليا سوداء عضوية', 'Tinned organic black beans, ready to use', 'فاصوليا سوداء عضوية معلبة، جاهزة للاستخدام', 99, 'pantry', '/images/black-beans.jpg', '400g tin', true, 'UK', '400g', '7g protein, 6g fibre per serving', 'Store in a cool, dry place', false),
  ('kidney-beans', 'Red Kidney Beans', 'فاصوليا حمراء', 'Premium red kidney beans, perfect for chilli and soups', 'فاصوليا حمراء فاخرة، مثالية للشوربة والأطباق', 89, 'pantry', '/images/kidney-beans.jpg', '400g tin', true, 'UK', '400g', '8g protein, 7g fibre per serving', 'Store in a cool, dry place', false),
  ('chickpeas', 'Organic Chickpeas', 'حمص عضوي', 'Versatile chickpeas for hummus, salads, and curries', 'حمص متعدد الاستخدامات للحمص والسلطات والكاري', 109, 'pantry', '/images/chickpeas.jpg', '400g tin', true, 'UK', '400g', '6g protein, 5g fibre per serving', 'Store in a cool, dry place', false),
  ('basmati-rice', 'Basmati Rice', 'أرز بسمتي', 'Premium long grain basmati rice, aromatic and fluffy', 'أرز بسمتي طويل الحبة فاخر، عطري ورقيق', 249, 'pantry', '/images/brown-rice.jpg', '1 kg bag', true, 'Pakistan / India', '1 kg', '5g protein, 3g fibre per serving', 'Store in a cool, dry place', false),
  ('pasta', 'Wholewheat Penne', 'بيني قمح كامل', 'Wholewheat penne pasta, perfect for healthy meals', 'معكرونة بيني من القمح الكامل، مثالية للوجبات الصحية', 149, 'pantry', '/images/pasta.jpg', '500g box', true, 'Italy', '500g', '7g protein, 6g fibre per serving', 'Store in a cool, dry place', false),
  ('olive-oil', 'Extra Virgin Olive Oil', 'زيت زيتون بكر ممتاز', 'Premium cold-pressed extra virgin olive oil', 'زيت زيتون بكر ممتاز معصور على البارد', 499, 'pantry', '/images/olive-oil.jpg', '500ml bottle', true, 'Spain', '500ml', 'Rich in healthy monounsaturated fats', 'Store away from heat and light', false)
ON CONFLICT (id) DO NOTHING;
