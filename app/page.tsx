import { Hero } from '@/components/store/hero'
import { CategorySection } from '@/components/store/category-section'
import { CATEGORIES, PRODUCTS, getProductsByCategory } from '@/lib/products'

export default function HomePage() {
  return (
    <div>
      <Hero />

      <div className="mx-auto max-w-7xl px-4 pb-16">
        {CATEGORIES.map((category) => {
          const products = getProductsByCategory(category.id).slice(0, 4)
          return (
            <CategorySection
              key={category.id}
              category={category}
              products={products}
              showViewAll
            />
          )
        })}
      </div>
    </div>
  )
}
