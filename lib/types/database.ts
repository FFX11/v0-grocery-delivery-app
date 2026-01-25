export type UserRole = 'customer' | 'admin' | 'superuser'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price_in_cents: number
  category_id: string | null
  image: string | null
  unit: string | null
  in_stock: boolean
  origin: string | null
  weight: string | null
  nutrition_info: string | null
  storage_instructions: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  // Joined fields
  category?: Category
}

export interface Order {
  id: string
  user_id: string | null
  customer_email: string
  customer_name: string | null
  customer_phone: string | null
  delivery_address: string | null
  delivery_option: string | null
  delivery_fee: number
  subtotal: number
  total: number
  status: OrderStatus
  stripe_session_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  items?: OrderItem[]
  profile?: Profile
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_price: number
  quantity: number
  created_at: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface CartItemWithProduct extends CartItem {
  product: Product
}
