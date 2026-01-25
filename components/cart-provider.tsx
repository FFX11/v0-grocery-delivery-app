'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  type Cart,
  type CartItem,
  getCartFromCookies,
  saveCartToCookies,
  getCartItemCount,
  calculateCartTotal,
} from '@/lib/cart'
import { PRODUCTS, type Product } from '@/lib/products'

interface CartContextType {
  cart: Cart
  items: CartItem[]
  itemCount: number
  total: number
  isLoading: boolean
  addItem: (productId: string, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  getItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], updatedAt: '' })
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from cookies on mount
  useEffect(() => {
    const savedCart = getCartFromCookies()
    setCart(savedCart)
    setIsLoading(false)
  }, [])

  const addItem = useCallback((productId: string, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.productId === productId
      )

      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        newItems = [...prevCart.items, { productId, quantity }]
      }

      const newCart: Cart = {
        items: newItems,
        updatedAt: new Date().toISOString(),
      }

      saveCartToCookies(newCart)
      return newCart
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prevCart) => {
      let newItems: CartItem[]

      if (quantity <= 0) {
        newItems = prevCart.items.filter((item) => item.productId !== productId)
      } else {
        newItems = prevCart.items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      }

      const newCart: Cart = {
        items: newItems,
        updatedAt: new Date().toISOString(),
      }

      saveCartToCookies(newCart)
      return newCart
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setCart((prevCart) => {
      const newCart: Cart = {
        items: prevCart.items.filter((item) => item.productId !== productId),
        updatedAt: new Date().toISOString(),
      }

      saveCartToCookies(newCart)
      return newCart
    })
  }, [])

  const clearCartItems = useCallback(() => {
    const emptyCart: Cart = { items: [], updatedAt: new Date().toISOString() }
    saveCartToCookies(emptyCart)
    setCart(emptyCart)
  }, [])

  const getItemQuantity = useCallback(
    (productId: string) => {
      const item = cart.items.find((item) => item.productId === productId)
      return item?.quantity ?? 0
    },
    [cart.items]
  )

  const itemCount = getCartItemCount(cart)
  const total = calculateCartTotal(cart, PRODUCTS)

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart.items,
        itemCount,
        total,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart: clearCartItems,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
