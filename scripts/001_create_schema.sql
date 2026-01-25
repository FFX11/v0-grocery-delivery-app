-- Create user roles enum
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'superuser');

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  price_in_cents INTEGER NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  image TEXT,
  unit TEXT,
  in_stock BOOLEAN DEFAULT true,
  origin TEXT,
  weight TEXT,
  nutrition_info TEXT,
  storage_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create order status enum
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
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
CREATE TABLE IF NOT EXISTS public.order_items (
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
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superuser')
    )
  );

CREATE POLICY "profiles_update_superuser" ON public.profiles 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superuser'
    )
  );

-- Categories policies (public read, admin/superuser write)
CREATE POLICY "categories_select_all" ON public.categories 
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "categories_insert_admin" ON public.categories 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superuser')
    )
  );

CREATE POLICY "categories_update_admin" ON public.categories 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superuser')
    )
  );

CREATE POLICY "categories_delete_superuser" ON public.categories 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superuser'
    )
  );

-- Products policies (public read, admin/superuser write)
CREATE POLICY "products_select_all" ON public.products 
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "products_insert_admin" ON public.products 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superuser')
    )
  );

CREATE POLICY "products_update_admin" ON public.products 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superuser')
    )
  );

CREATE POLICY "products_delete_admin" ON public.products 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superuser')
    )
  );

-- Orders policies (users see own, admin/superuser see all)
CREATE POLICY "orders_select_own" ON public.orders 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_select_admin" ON public.orders 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superuser')
    )
  );

CREATE POLICY "orders_insert_all" ON public.orders 
  FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "orders_update_admin" ON public.orders 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superuser')
    )
  );

-- Order items policies
CREATE POLICY "order_items_select_own" ON public.order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_select_admin" ON public.order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'superuser')
    )
  );

CREATE POLICY "order_items_insert_all" ON public.order_items 
  FOR INSERT TO authenticated, anon WITH CHECK (true);

-- Create trigger to auto-create profile on signup
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default categories
INSERT INTO public.categories (id, name, description, icon) VALUES
  ('groceries', 'Fresh Groceries', 'Fresh fruits, vegetables, and daily essentials', 'leaf'),
  ('meat', 'Meat & Poultry', 'Premium quality meats and poultry', 'drumstick'),
  ('pantry', 'Pantry Staples', 'Beans, grains, canned goods, and more', 'package')
ON CONFLICT (id) DO NOTHING;

-- Insert default products
INSERT INTO public.products (id, name, description, price_in_cents, category_id, image, unit, in_stock, origin, weight, nutrition_info, storage_instructions) VALUES
  ('organic-bananas', 'Organic Bananas', 'Fresh organic bananas, perfect for smoothies or snacking', 199, 'groceries', '/images/bananas.jpg', 'bunch', true, 'Ecuador', '1 lb average', 'Rich in potassium and fiber', 'Store at room temperature'),
  ('fresh-tomatoes', 'Roma Tomatoes', 'Vine-ripened roma tomatoes, great for sauces and salads', 349, 'groceries', '/images/tomatoes.jpg', 'lb', true, 'California, USA', '1 lb', 'High in lycopene and vitamin C', 'Refrigerate after cutting'),
  ('fresh-spinach', 'Baby Spinach', 'Tender baby spinach leaves, pre-washed and ready to eat', 499, 'groceries', '/images/spinach.jpg', '5 oz bag', true, 'California, USA', '5 oz', 'Excellent source of iron and vitamins A, C, K', 'Keep refrigerated'),
  ('red-apples', 'Gala Apples', 'Sweet and crispy Gala apples', 179, 'groceries', '/images/apples.jpg', 'each', true, 'Washington, USA', '6 oz average', 'Good source of fiber and vitamin C', 'Refrigerate for best freshness'),
  ('fresh-carrots', 'Organic Carrots', 'Crunchy organic carrots, perfect for snacking or cooking', 299, 'groceries', '/images/carrots.jpg', '1 lb bag', true, 'California, USA', '1 lb', 'High in beta-carotene and fiber', 'Keep refrigerated'),
  ('chicken-breast', 'Chicken Breast', 'Boneless, skinless chicken breast, antibiotic-free', 899, 'meat', '/images/chicken.jpg', 'lb', true, 'USA', '1 lb', '31g protein per serving', 'Keep frozen or refrigerate and use within 2 days'),
  ('ground-beef', 'Ground Beef 80/20', 'Fresh ground beef, perfect for burgers and meatballs', 749, 'meat', '/images/ground-beef.jpg', 'lb', true, 'USA', '1 lb', '20g protein per serving', 'Keep frozen or refrigerate and use within 2 days'),
  ('pork-chops', 'Bone-In Pork Chops', 'Thick-cut bone-in pork chops, perfect for grilling', 699, 'meat', '/images/pork-chops.jpg', 'lb', true, 'USA', '1 lb (2 chops avg)', '26g protein per serving', 'Keep frozen or refrigerate and use within 3 days'),
  ('salmon-fillet', 'Atlantic Salmon Fillet', 'Fresh Atlantic salmon, rich in omega-3 fatty acids', 1299, 'meat', '/images/salmon.jpg', 'lb', true, 'Norway', '1 lb', 'High in omega-3, 25g protein per serving', 'Keep refrigerated and use within 2 days'),
  ('turkey-breast', 'Turkey Breast', 'Lean turkey breast, great for healthy meals', 999, 'meat', '/images/turkey.jpg', 'lb', false, 'USA', '1 lb', '29g protein per serving, low fat', 'Keep frozen or refrigerate and use within 2 days'),
  ('black-beans', 'Organic Black Beans', 'Canned organic black beans, ready to use', 189, 'pantry', '/images/black-beans.jpg', '15 oz can', true, 'USA', '15 oz', '7g protein, 6g fiber per serving', 'Store in cool, dry place'),
  ('kidney-beans', 'Red Kidney Beans', 'Premium red kidney beans, perfect for chili and soups', 159, 'pantry', '/images/kidney-beans.jpg', '15 oz can', true, 'USA', '15 oz', '8g protein, 7g fiber per serving', 'Store in cool, dry place'),
  ('chickpeas', 'Organic Chickpeas', 'Versatile chickpeas for hummus, salads, and curries', 199, 'pantry', '/images/chickpeas.jpg', '15 oz can', true, 'USA', '15 oz', '6g protein, 5g fiber per serving', 'Store in cool, dry place'),
  ('brown-rice', 'Long Grain Brown Rice', 'Whole grain brown rice, nutritious and filling', 449, 'pantry', '/images/brown-rice.jpg', '2 lb bag', true, 'USA', '2 lb', '5g protein, 3g fiber per serving', 'Store in cool, dry place'),
  ('pasta', 'Whole Wheat Penne', 'Whole wheat penne pasta, perfect for healthy meals', 299, 'pantry', '/images/pasta.jpg', '16 oz box', true, 'Italy', '16 oz', '7g protein, 6g fiber per serving', 'Store in cool, dry place'),
  ('olive-oil', 'Extra Virgin Olive Oil', 'Premium cold-pressed extra virgin olive oil', 1199, 'pantry', '/images/olive-oil.jpg', '500ml bottle', true, 'Spain', '500ml', 'Rich in healthy monounsaturated fats', 'Store away from heat and light')
ON CONFLICT (id) DO NOTHING;
