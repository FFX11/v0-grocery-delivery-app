import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tags } from 'lucide-react'

async function getCategories() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Get product counts for each category
  const { data: products } = await supabase
    .from('products')
    .select('category_id')

  const productCounts: Record<string, number> = {}
  for (const product of products || []) {
    if (product.category_id) {
      productCounts[product.category_id] = (productCounts[product.category_id] || 0) + 1
    }
  }

  return (categories || []).map((cat) => ({
    ...cat,
    productCount: productCounts[cat.id] || 0,
  }))
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          View your product categories
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
          <Tags className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No categories yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Categories are created via database seed.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {category.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.productCount} products</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {category.id}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
