'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface ProductFormState {
  error?: string
  success?: string
}

export async function createProduct(
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to create products' }
  }

  // Check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superuser')) {
    return { error: 'You do not have permission to create products' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const priceStr = formData.get('price') as string
  const categoryId = formData.get('category_id') as string
  const image = formData.get('image') as string
  const unit = formData.get('unit') as string
  const inStock = formData.get('in_stock') === 'on'
  const origin = formData.get('origin') as string
  const weight = formData.get('weight') as string
  const nutritionInfo = formData.get('nutrition_info') as string
  const storageInstructions = formData.get('storage_instructions') as string

  if (!name || !priceStr) {
    return { error: 'Name and price are required' }
  }

  const price = Number.parseFloat(priceStr)
  if (Number.isNaN(price) || price < 0) {
    return { error: 'Please enter a valid price' }
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const priceInCents = Math.round(price * 100)

  const { error } = await supabase.from('products').insert({
    name,
    slug,
    description: description || null,
    price_in_cents: priceInCents,
    category_id: categoryId || null,
    image: image || null,
    unit: unit || null,
    in_stock: inStock,
    origin: origin || null,
    weight: weight || null,
    nutrition_info: nutritionInfo || null,
    storage_instructions: storageInstructions || null,
    created_by: user.id,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'A product with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath('/')
  redirect('/admin/products')
}

export async function updateProduct(
  productId: string,
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to update products' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superuser')) {
    return { error: 'You do not have permission to update products' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const priceStr = formData.get('price') as string
  const categoryId = formData.get('category_id') as string
  const image = formData.get('image') as string
  const unit = formData.get('unit') as string
  const inStock = formData.get('in_stock') === 'on'
  const origin = formData.get('origin') as string
  const weight = formData.get('weight') as string
  const nutritionInfo = formData.get('nutrition_info') as string
  const storageInstructions = formData.get('storage_instructions') as string

  if (!name || !priceStr) {
    return { error: 'Name and price are required' }
  }

  const price = Number.parseFloat(priceStr)
  if (Number.isNaN(price) || price < 0) {
    return { error: 'Please enter a valid price' }
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const priceInCents = Math.round(price * 100)

  const { error } = await supabase
    .from('products')
    .update({
      name,
      slug,
      description: description || null,
      price_in_cents: priceInCents,
      category_id: categoryId || null,
      image: image || null,
      unit: unit || null,
      in_stock: inStock,
      origin: origin || null,
      weight: weight || null,
      nutrition_info: nutritionInfo || null,
      storage_instructions: storageInstructions || null,
    })
    .eq('id', productId)

  if (error) {
    if (error.code === '23505') {
      return { error: 'A product with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath('/')
  revalidatePath(`/product/${productId}`)
  redirect('/admin/products')
}

export async function deleteProduct(productId: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to delete products' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superuser')) {
    return { error: 'You do not have permission to delete products' }
  }

  const { error } = await supabase.from('products').delete().eq('id', productId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath('/')
  return {}
}

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProduct(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}
