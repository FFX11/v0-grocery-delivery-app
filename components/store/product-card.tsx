'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/components/cart-provider'
import { type Product, formatPrice } from '@/lib/products'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, getItemQuantity, updateQuantity } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [imageError, setImageError] = useState(false)

  const quantity = getItemQuantity(product.id)

  const handleAddToCart = async () => {
    if (!product.inStock) return

    setIsAdding(true)
    try {
      addItem(product.id, 1)
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    } finally {
      setTimeout(() => setIsAdding(false), 300)
    }
  }

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1)
  }

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1)
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-muted">
        {imageError ? (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
          </div>
        ) : (
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Badge variant="secondary" className="text-sm">
              Out of Stock
            </Badge>
          </div>
        )}
      </Link>

      <CardContent className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.id}`} className="group/link">
          <h3 className="font-semibold text-foreground transition-colors group-hover/link:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {formatPrice(product.priceInCents)}
          </span>
          <span className="text-sm text-muted-foreground">/ {product.unit}</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {quantity === 0 ? (
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
            className="w-full"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </Button>
        ) : (
          <div className="flex w-full items-center justify-between rounded-md border border-input bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDecrement}
              className="h-9 w-9 rounded-r-none"
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <span className="flex-1 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleIncrement}
              className="h-9 w-9 rounded-l-none"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
