'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2, ShoppingCart, ArrowLeft, Truck, Zap, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useCart } from '@/components/cart-provider'
import { startCheckoutSession, type DeliveryInfo } from '@/app/actions/stripe'
import { PRODUCTS, formatPrice, getProductById } from '@/lib/products'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const FREE_DELIVERY_THRESHOLD = 5000

const deliveryOptions = [
  {
    id: 'standard' as const,
    name: 'Standard Delivery',
    description: '3-5 business days',
    fee: 499,
    icon: Truck,
  },
  {
    id: 'express' as const,
    name: 'Express Delivery',
    description: '1-2 business days',
    fee: 999,
    icon: Zap,
  },
  {
    id: 'same-day' as const,
    name: 'Same Day Delivery',
    description: 'Delivered today',
    fee: 1499,
    icon: Clock,
  },
]

type CheckoutStep = 'delivery' | 'payment' | 'complete'

export function CheckoutFlow() {
  const router = useRouter()
  const { items, total, isLoading, clearCart } = useCart()
  const [step, setStep] = useState<CheckoutStep>('delivery')
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryInfo['method']>('standard')
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const isFreeDelivery = total >= FREE_DELIVERY_THRESHOLD
  const selectedDelivery = deliveryOptions.find((d) => d.id === deliveryMethod)!
  const deliveryFee = isFreeDelivery ? 0 : selectedDelivery.fee
  const grandTotal = total + deliveryFee

  // Get valid cart items
  const validCartItems = items
    .map((item) => ({
      ...item,
      product: getProductById(item.productId),
    }))
    .filter((item) => item.product !== undefined)

  const fetchClientSecret = useCallback(async () => {
    try {
      setError(null)
      const secret = await startCheckoutSession(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryMethod
      )
      if (!secret) {
        throw new Error('Failed to create checkout session')
      }
      return secret
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize checkout'
      setError(message)
      throw err
    }
  }, [items, deliveryMethod])

  const handleComplete = useCallback(() => {
    clearCart()
    setStep('complete')
  }, [clearCart])

  // Show loading while cart loads
  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Show empty cart message
  if (items.length === 0 && step !== 'complete') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-muted p-6">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-foreground">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">
          Add some items to your cart before checking out.
        </p>
        <Link href="/" className="mt-6">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  // Order complete
  if (step === 'complete') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-primary/10 p-6">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-foreground">Order Complete!</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Thank you for your order. You will receive a confirmation email shortly with your 
          order details and tracking information.
        </p>
        <Link href="/" className="mt-8">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Back to Cart */}
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Link>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'delivery' && (
        <>
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {validCartItems.length} {validCartItems.length === 1 ? 'item' : 'items'} in your
                cart
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {validCartItems.map(({ productId, quantity, product }) => (
                  <div key={productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {product?.name} x {quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      {product && formatPrice(product.priceInCents * quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
              <CardDescription>
                {isFreeDelivery
                  ? 'Congratulations! You qualify for free delivery.'
                  : `Add ${formatPrice(FREE_DELIVERY_THRESHOLD - total)} more for free delivery.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(value) => setDeliveryMethod(value as DeliveryInfo['method'])}
                className="space-y-3"
              >
                {deliveryOptions.map((option) => {
                  const Icon = option.icon
                  const fee = isFreeDelivery ? 0 : option.fee

                  return (
                    <Label
                      key={option.id}
                      htmlFor={option.id}
                      className="flex cursor-pointer items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{option.name}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <span className="font-semibold text-foreground">
                        {fee === 0 ? 'FREE' : formatPrice(fee)}
                      </span>
                    </Label>
                  )
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Total and Continue */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-foreground">
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                className="mt-6 w-full text-base"
                onClick={() => setStep('payment')}
              >
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {step === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>
              Complete your order securely with Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('delivery')}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Delivery
              </Button>
            </div>
            <div id="checkout" className="min-h-[400px]">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{
                  fetchClientSecret,
                  onComplete: handleComplete,
                }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
