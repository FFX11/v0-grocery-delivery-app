'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Plus, Minus, Trash2, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/components/cart-provider'
import { PRODUCTS, formatPrice, getProductById } from '@/lib/products'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const FREE_DELIVERY_THRESHOLD = 5000 // $50 in cents

export function CartContent() {
  const { items, total, isLoading, updateQuantity, removeItem, clearCart } = useCart()
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-muted p-6">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-foreground">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">
          Add some items to your cart to get started.
        </p>
        <Link href="/" className="mt-6">
          <Button size="lg">
            Continue Shopping
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    )
  }

  const deliveryFee = total >= FREE_DELIVERY_THRESHOLD ? 0 : 499 // $4.99
  const grandTotal = total + deliveryFee
  const remainingForFreeDelivery = FREE_DELIVERY_THRESHOLD - total

  // Get only valid products (that exist in our catalog)
  const validCartItems = items
    .map((item) => ({
      ...item,
      product: getProductById(item.productId),
    }))
    .filter((item) => item.product !== undefined)

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {validCartItems.length} {validCartItems.length === 1 ? 'Item' : 'Items'}
            </CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  Clear Cart
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all items from your cart. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearCart} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Clear Cart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {validCartItems.map(({ productId, quantity, product }) => {
              if (!product) return null

              return (
                <div key={productId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {/* Product Image */}
                  <Link
                    href={`/product/${product.id}`}
                    className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
                  >
                    {imageErrors[product.id] ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    ) : (
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(product.id)}
                        sizes="96px"
                      />
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/product/${product.id}`}
                          className="font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatPrice(product.priceInCents)} / {product.unit}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(productId)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-md border border-input bg-background">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(productId, quantity - 1)}
                          className="h-8 w-8 rounded-r-none"
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(productId, quantity + 1)}
                          className="h-8 w-8 rounded-l-none"
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </div>

                      {/* Item Total */}
                      <p className="font-semibold text-foreground">
                        {formatPrice(product.priceInCents * quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Continue Shopping */}
        <div className="mt-6">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {remainingForFreeDelivery > 0 && (
              <div className="rounded-lg bg-primary/10 p-3 text-sm">
                <p className="text-foreground">
                  Add{' '}
                  <span className="font-semibold">
                    {formatPrice(remainingForFreeDelivery)}
                  </span>{' '}
                  more for free delivery!
                </p>
              </div>
            )}

            <Separator />

            <div className="flex justify-between">
              <span className="text-lg font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/checkout" className="w-full">
              <Button size="lg" className="w-full text-base">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
