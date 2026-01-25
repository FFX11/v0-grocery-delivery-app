export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  category: 'groceries' | 'meat' | 'pantry'
  image: string
  unit: string
  inStock: boolean
  details: {
    origin?: string
    weight?: string
    nutritionInfo?: string
    storageInstructions?: string
  }
}

export interface Category {
  id: 'groceries' | 'meat' | 'pantry'
  name: string
  description: string
  icon: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'groceries',
    name: 'Fresh Groceries',
    description: 'Fresh fruits, vegetables, and daily essentials',
    icon: 'leaf',
  },
  {
    id: 'meat',
    name: 'Meat & Poultry',
    description: 'Premium quality meats and poultry',
    icon: 'drumstick',
  },
  {
    id: 'pantry',
    name: 'Pantry Staples',
    description: 'Beans, grains, canned goods, and more',
    icon: 'package',
  },
]

export const PRODUCTS: Product[] = [
  // Groceries
  {
    id: 'organic-bananas',
    name: 'Organic Bananas',
    description: 'Fresh organic bananas, perfect for smoothies or snacking',
    priceInCents: 199,
    category: 'groceries',
    image: '/images/bananas.jpg',
    unit: 'bunch',
    inStock: true,
    details: {
      origin: 'Ecuador',
      weight: '1 lb average',
      nutritionInfo: 'Rich in potassium and fiber',
      storageInstructions: 'Store at room temperature',
    },
  },
  {
    id: 'fresh-tomatoes',
    name: 'Roma Tomatoes',
    description: 'Vine-ripened roma tomatoes, great for sauces and salads',
    priceInCents: 349,
    category: 'groceries',
    image: '/images/tomatoes.jpg',
    unit: 'lb',
    inStock: true,
    details: {
      origin: 'California, USA',
      weight: '1 lb',
      nutritionInfo: 'High in lycopene and vitamin C',
      storageInstructions: 'Refrigerate after cutting',
    },
  },
  {
    id: 'fresh-spinach',
    name: 'Baby Spinach',
    description: 'Tender baby spinach leaves, pre-washed and ready to eat',
    priceInCents: 499,
    category: 'groceries',
    image: '/images/spinach.jpg',
    unit: '5 oz bag',
    inStock: true,
    details: {
      origin: 'California, USA',
      weight: '5 oz',
      nutritionInfo: 'Excellent source of iron and vitamins A, C, K',
      storageInstructions: 'Keep refrigerated',
    },
  },
  {
    id: 'red-apples',
    name: 'Gala Apples',
    description: 'Sweet and crispy Gala apples',
    priceInCents: 179,
    category: 'groceries',
    image: '/images/apples.jpg',
    unit: 'each',
    inStock: true,
    details: {
      origin: 'Washington, USA',
      weight: '6 oz average',
      nutritionInfo: 'Good source of fiber and vitamin C',
      storageInstructions: 'Refrigerate for best freshness',
    },
  },
  {
    id: 'fresh-carrots',
    name: 'Organic Carrots',
    description: 'Crunchy organic carrots, perfect for snacking or cooking',
    priceInCents: 299,
    category: 'groceries',
    image: '/images/carrots.jpg',
    unit: '1 lb bag',
    inStock: true,
    details: {
      origin: 'California, USA',
      weight: '1 lb',
      nutritionInfo: 'High in beta-carotene and fiber',
      storageInstructions: 'Keep refrigerated',
    },
  },
  // Meat
  {
    id: 'chicken-breast',
    name: 'Chicken Breast',
    description: 'Boneless, skinless chicken breast, antibiotic-free',
    priceInCents: 899,
    category: 'meat',
    image: '/images/chicken.jpg',
    unit: 'lb',
    inStock: true,
    details: {
      origin: 'USA',
      weight: '1 lb',
      nutritionInfo: '31g protein per serving',
      storageInstructions: 'Keep frozen or refrigerate and use within 2 days',
    },
  },
  {
    id: 'ground-beef',
    name: 'Ground Beef 80/20',
    description: 'Fresh ground beef, perfect for burgers and meatballs',
    priceInCents: 749,
    category: 'meat',
    image: '/images/ground-beef.jpg',
    unit: 'lb',
    inStock: true,
    details: {
      origin: 'USA',
      weight: '1 lb',
      nutritionInfo: '20g protein per serving',
      storageInstructions: 'Keep frozen or refrigerate and use within 2 days',
    },
  },
  {
    id: 'pork-chops',
    name: 'Bone-In Pork Chops',
    description: 'Thick-cut bone-in pork chops, perfect for grilling',
    priceInCents: 699,
    category: 'meat',
    image: '/images/pork-chops.jpg',
    unit: 'lb',
    inStock: true,
    details: {
      origin: 'USA',
      weight: '1 lb (2 chops avg)',
      nutritionInfo: '26g protein per serving',
      storageInstructions: 'Keep frozen or refrigerate and use within 3 days',
    },
  },
  {
    id: 'salmon-fillet',
    name: 'Atlantic Salmon Fillet',
    description: 'Fresh Atlantic salmon, rich in omega-3 fatty acids',
    priceInCents: 1299,
    category: 'meat',
    image: '/images/salmon.jpg',
    unit: 'lb',
    inStock: true,
    details: {
      origin: 'Norway',
      weight: '1 lb',
      nutritionInfo: 'High in omega-3, 25g protein per serving',
      storageInstructions: 'Keep refrigerated and use within 2 days',
    },
  },
  {
    id: 'turkey-breast',
    name: 'Turkey Breast',
    description: 'Lean turkey breast, great for healthy meals',
    priceInCents: 999,
    category: 'meat',
    image: '/images/turkey.jpg',
    unit: 'lb',
    inStock: false,
    details: {
      origin: 'USA',
      weight: '1 lb',
      nutritionInfo: '29g protein per serving, low fat',
      storageInstructions: 'Keep frozen or refrigerate and use within 2 days',
    },
  },
  // Pantry
  {
    id: 'black-beans',
    name: 'Organic Black Beans',
    description: 'Canned organic black beans, ready to use',
    priceInCents: 189,
    category: 'pantry',
    image: '/images/black-beans.jpg',
    unit: '15 oz can',
    inStock: true,
    details: {
      origin: 'USA',
      weight: '15 oz',
      nutritionInfo: '7g protein, 6g fiber per serving',
      storageInstructions: 'Store in cool, dry place',
    },
  },
  {
    id: 'kidney-beans',
    name: 'Red Kidney Beans',
    description: 'Premium red kidney beans, perfect for chili and soups',
    priceInCents: 159,
    category: 'pantry',
    image: '/images/kidney-beans.jpg',
    unit: '15 oz can',
    inStock: true,
    details: {
      origin: 'USA',
      weight: '15 oz',
      nutritionInfo: '8g protein, 7g fiber per serving',
      storageInstructions: 'Store in cool, dry place',
    },
  },
  {
    id: 'chickpeas',
    name: 'Organic Chickpeas',
    description: 'Versatile chickpeas for hummus, salads, and curries',
    priceInCents: 199,
    category: 'pantry',
    image: '/images/chickpeas.jpg',
    unit: '15 oz can',
    inStock: true,
    details: {
      origin: 'USA',
      weight: '15 oz',
      nutritionInfo: '6g protein, 5g fiber per serving',
      storageInstructions: 'Store in cool, dry place',
    },
  },
  {
    id: 'brown-rice',
    name: 'Long Grain Brown Rice',
    description: 'Whole grain brown rice, nutritious and filling',
    priceInCents: 449,
    category: 'pantry',
    image: '/images/brown-rice.jpg',
    unit: '2 lb bag',
    inStock: true,
    details: {
      origin: 'USA',
      weight: '2 lb',
      nutritionInfo: '5g protein, 3g fiber per serving',
      storageInstructions: 'Store in cool, dry place',
    },
  },
  {
    id: 'pasta',
    name: 'Whole Wheat Penne',
    description: 'Whole wheat penne pasta, perfect for healthy meals',
    priceInCents: 299,
    category: 'pantry',
    image: '/images/pasta.jpg',
    unit: '16 oz box',
    inStock: true,
    details: {
      origin: 'Italy',
      weight: '16 oz',
      nutritionInfo: '7g protein, 6g fiber per serving',
      storageInstructions: 'Store in cool, dry place',
    },
  },
  {
    id: 'olive-oil',
    name: 'Extra Virgin Olive Oil',
    description: 'Premium cold-pressed extra virgin olive oil',
    priceInCents: 1199,
    category: 'pantry',
    image: '/images/olive-oil.jpg',
    unit: '500ml bottle',
    inStock: true,
    details: {
      origin: 'Spain',
      weight: '500ml',
      nutritionInfo: 'Rich in healthy monounsaturated fats',
      storageInstructions: 'Store away from heat and light',
    },
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id)
}

export function getProductsByCategory(category: Product['category']): Product[] {
  return PRODUCTS.filter((product) => product.category === category)
}

export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100)
}
