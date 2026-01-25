import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductById, PRODUCTS, formatPrice, CATEGORIES } from '@/lib/products'
import { ProductDetails } from '@/components/store/product-details'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = getProductById(id)

  if (!product) {
    return {
      title: 'Product Not Found - FreshMart',
    }
  }

  return {
    title: `${product.name} - FreshMart`,
    description: product.description,
  }
}

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = getProductById(id)

  if (!product) {
    notFound()
  }

  const category = CATEGORIES.find((c) => c.id === product.category)
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4)

  return (
    <ProductDetails
      product={product}
      category={category}
      relatedProducts={relatedProducts}
    />
  )
}
