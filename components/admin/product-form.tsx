'use client'

import { useActionState } from 'react'
import { createProduct, updateProduct, type ProductFormState } from '@/app/actions/products'
import type { Product, Category } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ProductFormProps {
  product?: Product
  categories: Category[]
}

const initialState: ProductFormState = {}

export function ProductForm({ product, categories }: ProductFormProps) {
  const isEdit = !!product

  const action = isEdit
    ? updateProduct.bind(null, product.id)
    : createProduct

  const [state, formAction, isPending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Product name, description, and pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                placeholder="e.g., Organic Bananas"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={product?.description || ''}
                placeholder="Describe your product..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={
                    product ? (product.price_in_cents / 100).toFixed(2) : ''
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select
                  name="category_id"
                  defaultValue={product?.category_id || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                type="url"
                defaultValue={product?.image || ''}
                placeholder="/images/product.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL for the product image
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Additional product information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  name="unit"
                  defaultValue={product?.unit || ''}
                  placeholder="e.g., lb, each, oz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight/Size</Label>
                <Input
                  id="weight"
                  name="weight"
                  defaultValue={product?.weight || ''}
                  placeholder="e.g., 1 lb, 16 oz"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                name="origin"
                defaultValue={product?.origin || ''}
                placeholder="e.g., California, USA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nutrition_info">Nutrition Info</Label>
              <Textarea
                id="nutrition_info"
                name="nutrition_info"
                defaultValue={product?.nutrition_info || ''}
                placeholder="e.g., High in fiber and protein..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage_instructions">Storage Instructions</Label>
              <Textarea
                id="storage_instructions"
                name="storage_instructions"
                defaultValue={product?.storage_instructions || ''}
                placeholder="e.g., Keep refrigerated..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="in_stock">In Stock</Label>
                <p className="text-sm text-muted-foreground">
                  Is this product available for purchase?
                </p>
              </div>
              <Switch
                id="in_stock"
                name="in_stock"
                defaultChecked={product?.in_stock ?? true}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Link href="/admin/products">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : isEdit ? (
            'Update Product'
          ) : (
            'Create Product'
          )}
        </Button>
      </div>
    </form>
  )
}
