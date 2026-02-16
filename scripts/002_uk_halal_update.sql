-- Add halal_certified column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS halal_certified BOOLEAN DEFAULT false;

-- Update category descriptions for UK market
UPDATE public.categories SET 
  name = 'Fresh Groceries',
  description = 'Fresh fruits, vegetables, and daily essentials'
WHERE id = 'groceries';

UPDATE public.categories SET 
  name = 'Halal Meat & Poultry',
  description = 'Premium quality HMC certified halal meats and poultry'
WHERE id = 'meat';

UPDATE public.categories SET 
  name = 'Pantry Staples',
  description = 'Beans, grains, canned goods, and more'
WHERE id = 'pantry';

-- Update existing product prices to GBP (UK prices) and origins to UK suppliers
-- Groceries
UPDATE public.products SET price_in_cents = 129, origin = 'Ecuador / UK Import', halal_certified = false WHERE id = 'organic-bananas';
UPDATE public.products SET price_in_cents = 199, origin = 'UK Grown', halal_certified = false, name = 'Vine Tomatoes', description = 'Vine-ripened tomatoes, perfect for sauces and salads' WHERE id = 'fresh-tomatoes';
UPDATE public.products SET price_in_cents = 150, origin = 'UK Grown', halal_certified = false WHERE id = 'fresh-spinach';
UPDATE public.products SET price_in_cents = 75, origin = 'UK Grown', halal_certified = false, name = 'Royal Gala Apples', description = 'Sweet and crispy Royal Gala apples' WHERE id = 'red-apples';
UPDATE public.products SET price_in_cents = 99, origin = 'UK Grown', halal_certified = false WHERE id = 'fresh-carrots';

-- Halal Meat - update all to be halal certified with UK-appropriate pricing
UPDATE public.products SET price_in_cents = 599, origin = 'UK HMC Certified', halal_certified = true, name = 'Halal Chicken Breast', description = 'HMC certified boneless, skinless chicken breast. Hand-slaughtered and blessed.' WHERE id = 'chicken-breast';
UPDATE public.products SET price_in_cents = 699, origin = 'UK HMC Certified', halal_certified = true, name = 'Halal Minced Beef', description = 'HMC certified premium minced beef, perfect for kebabs and keema' WHERE id = 'ground-beef';
UPDATE public.products SET price_in_cents = 799, origin = 'UK HMC Certified', halal_certified = true, name = 'Halal Lamb Chops', description = 'HMC certified tender lamb chops, ideal for grilling or curries' WHERE id = 'pork-chops';
UPDATE public.products SET price_in_cents = 999, origin = 'Scottish HMC Certified', halal_certified = true, name = 'Halal Salmon Fillet', description = 'Fresh Scottish salmon fillet, naturally halal and rich in omega-3', image = '/images/salmon.jpg' WHERE id = 'salmon-fillet';
UPDATE public.products SET price_in_cents = 749, origin = 'UK HMC Certified', halal_certified = true, name = 'Halal Turkey Breast', description = 'HMC certified lean turkey breast, great for healthy meals', in_stock = true WHERE id = 'turkey-breast';

-- Pantry items - UK pricing in pence
UPDATE public.products SET price_in_cents = 99, origin = 'UK', halal_certified = false WHERE id = 'black-beans';
UPDATE public.products SET price_in_cents = 89, origin = 'UK', halal_certified = false WHERE id = 'kidney-beans';
UPDATE public.products SET price_in_cents = 109, origin = 'UK', halal_certified = false WHERE id = 'chickpeas';
UPDATE public.products SET price_in_cents = 249, origin = 'UK', halal_certified = false, unit = '1 kg bag', weight = '1 kg', name = 'Basmati Rice', description = 'Premium long grain basmati rice, aromatic and fluffy' WHERE id = 'brown-rice';
UPDATE public.products SET price_in_cents = 149, origin = 'Italy', halal_certified = false, unit = '500g box', weight = '500g' WHERE id = 'pasta';
UPDATE public.products SET price_in_cents = 499, origin = 'Spain', halal_certified = false WHERE id = 'olive-oil';

-- Add new halal lamb image product
INSERT INTO public.products (id, name, description, price_in_cents, category_id, image, unit, in_stock, origin, weight, nutrition_info, storage_instructions, halal_certified) VALUES
  ('lamb-leg', 'Halal Leg of Lamb', 'HMC certified whole leg of lamb, perfect for Sunday roast', 1299, 'meat', '/images/pork-chops.jpg', 'kg', true, 'UK HMC Certified', '2 kg avg', '25g protein per serving', 'Keep frozen or refrigerate and use within 3 days', true)
ON CONFLICT (id) DO NOTHING;
