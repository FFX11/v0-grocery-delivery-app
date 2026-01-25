'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronRight, Plus, Minus, ShoppingCart, Truck, Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/components/cart-provider'
import { ProductCard } from './product-card'
import { type Product, type Category, formatPrice } from '@/lib/products'

interface ProductDetailsProps {
  product: Product
  category?: Category
  relatedProducts: Product[]
}

export function ProductDetails({ product, category, relatedProducts }: ProductDetailsProps) {
  const { addItem, getItemQuantity, updateQuantity } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const cartQuantity = getItemQuantity(product.id)

  const handleAddToCart = async () => {
    if (!product.inStock) return

    setIsAdding(true)
    try {
      addItem(product.id, quantity)
      setQuantity(1)
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    } finally {
      setTimeout(() => setIsAdding(false), 300)
    }
  }

  const incrementQuantity = () => setQuantity((q) => q + 1)
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        {category && (
          <>
            <Link
              href={`/category/${category.id}`}
              className="transition-colors hover:text-foreground"
            >
              {category.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Back button for mobile */}
      <Link
        href={category ? `/category/${category.id}` : '/'}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground md:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {category?.name || 'Shop'}
      </Link>

      {/* Product Details */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {imageError ? (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingCart className="h-24 w-24 text-muted-foreground/50" />
            </div>
          ) : (
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="secondary" className="text-lg">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div>
            {category && (
              <Badge variant="outline" className="mb-2">
                {category.name}
              </Badge>
            )}
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">
                {formatPrice(product.priceInCents)}
              </span>
              <span className="text-lg text-muted-foreground">/ {product.unit}</span>
            </div>

            {cartQuantity > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {cartQuantity} already in your cart
              </p>
            )}
          </div>

          <Separator className="my-6" />

          {/* Add to Cart */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Quantity:</span>
              <div className="flex items-center rounded-md border border-input bg-background">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-r-none"
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={incrementQuantity}
                  className="h-10 w-10 rounded-l-none"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!product.inStock || isAdding}
              className="w-full text-base md:w-auto"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Product Details</h3>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {product.details.origin && (
                <div>
                  <dt className="text-muted-foreground">Origin</dt>
                  <dd className="font-medium text-foreground">{product.details.origin}</dd>
                </div>
              )}
              {product.details.weight && (
                <div>
                  <dt className="text-muted-foreground">Weight</dt>
                  <dd className="font-medium text-foreground">{product.details.weight}</dd>
                </div>
              )}
              {product.details.nutritionInfo && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Nutrition</dt>
                  <dd className="font-medium text-foreground">{product.details.nutritionInfo}</dd>
                </div>
              )}
              {product.details.storageInstructions && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Storage</dt>
                  <dd className="font-medium text-foreground">
                    {product.details.storageInstructions}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <Separator className="my-6" />

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Free Delivery</p>
                <p className="text-xs text-muted-foreground">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Quality Guarantee</p>
                <p className="text-xs text-muted-foreground">Fresh or refund</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">You might also like</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
