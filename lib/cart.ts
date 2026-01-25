import { Product } from './products'

export interface CartItem {
  productId: string
  quantity: number
}

export interface Cart {
  items: CartItem[]
  updatedAt: string
}

const CART_COOKIE_NAME = 'grocery-cart'
const CART_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function getCartFromCookies(): Cart {
  if (typeof document === 'undefined') {
    return { items: [], updatedAt: new Date().toISOString() }
  }

  try {
    const cookies = document.cookie.split(';')
    const cartCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${CART_COOKIE_NAME}=`)
    )

    if (!cartCookie) {
      return { items: [], updatedAt: new Date().toISOString() }
    }

    const cartValue = cartCookie.split('=')[1]
    const decoded = decodeURIComponent(cartValue)
    const cart = JSON.parse(decoded) as Cart

    // Validate cart structure
    if (!cart.items || !Array.isArray(cart.items)) {
      return { items: [], updatedAt: new Date().toISOString() }
    }

    return cart
  } catch (error) {
    console.error('Error parsing cart cookie:', error)
    return { items: [], updatedAt: new Date().toISOString() }
  }
}

export function saveCartToCookies(cart: Cart): void {
  if (typeof document === 'undefined') {
    return
  }

  try {
    const cartData: Cart = {
      items: cart.items,
      updatedAt: new Date().toISOString(),
    }

    const encoded = encodeURIComponent(JSON.stringify(cartData))
    document.cookie = `${CART_COOKIE_NAME}=${encoded}; path=/; max-age=${CART_MAX_AGE}; SameSite=Lax`
  } catch (error) {
    console.error('Error saving cart cookie:', error)
  }
}

export function addToCart(productId: string, quantity: number = 1): Cart {
  const cart = getCartFromCookies()

  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId === productId
  )

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity
  } else {
    cart.items.push({ productId, quantity })
  }

  saveCartToCookies(cart)
  return cart
}

export function updateCartItemQuantity(
  productId: string,
  quantity: number
): Cart {
  const cart = getCartFromCookies()

  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item.productId !== productId)
  } else {
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    )

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity = quantity
    }
  }

  saveCartToCookies(cart)
  return cart
}

export function removeFromCart(productId: string): Cart {
  const cart = getCartFromCookies()
  cart.items = cart.items.filter((item) => item.productId !== productId)
  saveCartToCookies(cart)
  return cart
}

export function clearCart(): Cart {
  const emptyCart: Cart = { items: [], updatedAt: new Date().toISOString() }
  saveCartToCookies(emptyCart)
  return emptyCart
}

export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((total, item) => total + item.quantity, 0)
}

export function calculateCartTotal(
  cart: Cart,
  products: Product[]
): number {
  return cart.items.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId)
    if (product) {
      return total + product.priceInCents * item.quantity
    }
    return total
  }, 0)
}
