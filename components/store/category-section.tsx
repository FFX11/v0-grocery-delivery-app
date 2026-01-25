import Link from 'next/link'
import { ArrowRight, Leaf, Drumstick, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from './product-card'
import { type Category, type Product } from '@/lib/products'

interface CategorySectionProps {
  category: Category
  products: Product[]
  showViewAll?: boolean
}

const categoryIcons = {
  groceries: Leaf,
  meat: Drumstick,
  pantry: Package,
}

export function CategorySection({
  category,
  products,
  showViewAll = true,
}: CategorySectionProps) {
  const Icon = categoryIcons[category.id]

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{category.name}</h2>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>
        {showViewAll && (
          <Link href={`/category/${category.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
