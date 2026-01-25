import type { Metadata } from 'next'
import { CheckoutFlow } from '@/components/store/checkout-flow'

export const metadata: Metadata = {
  title: 'Checkout - FreshMart',
  description: 'Complete your order and choose delivery options',
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Checkout</h1>
      <CheckoutFlow />
    </div>
  )
}
