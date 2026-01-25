import type { Metadata } from 'next'
import { CartContent } from '@/components/store/cart-content'

export const metadata: Metadata = {
  title: 'Shopping Cart - FreshMart',
  description: 'Review your shopping cart and proceed to checkout',
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Shopping Cart</h1>
      <CartContent />
    </div>
  )
}
