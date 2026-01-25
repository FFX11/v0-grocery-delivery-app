import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CATEGORIES, getProductsByCategory } from '@/lib/products'
import { CategorySection } from '@/components/store/category-section'

interface CategoryPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { id } = await params
  const category = CATEGORIES.find((c) => c.id === id)

  if (!category) {
    return {
      title: 'Category Not Found - FreshMart',
    }
  }

  return {
    title: `${category.name} - FreshMart`,
    description: category.description,
  }
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    id: category.id,
  }))
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params
  const category = CATEGORIES.find((c) => c.id === id)

  if (!category) {
    notFound()
  }

  const products = getProductsByCategory(category.id as 'groceries' | 'meat' | 'pantry')

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <CategorySection category={category} products={products} showViewAll={false} />

      {products.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            No products found in this category.
          </p>
        </div>
      )}
    </div>
  )
}
