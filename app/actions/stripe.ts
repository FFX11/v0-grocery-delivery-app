'use server'

import { stripe } from '@/lib/stripe'
import { getProductById, type Product } from '@/lib/products'

export interface CheckoutItem {
  productId: string
  quantity: number
}

export interface DeliveryInfo {
  method: 'standard' | 'express' | 'same-day'
  fee: number
}

const DELIVERY_OPTIONS = {
  standard: { name: 'Standard Delivery (3-5 days)', fee: 499 },
  express: { name: 'Express Delivery (1-2 days)', fee: 999 },
  'same-day': { name: 'Same Day Delivery', fee: 1499 },
}

const FREE_DELIVERY_THRESHOLD = 5000 // $50

export async function startCheckoutSession(
  items: CheckoutItem[],
  deliveryMethod: DeliveryInfo['method'] = 'standard'
) {
  // Validate items
  if (!items || items.length === 0) {
    throw new Error('Cart is empty')
  }

  // Validate and get products with server-side prices
  const validatedItems: { product: Product; quantity: number }[] = []

  for (const item of items) {
    if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
      throw new Error(`Invalid item: ${JSON.stringify(item)}`)
    }

    const product = getProductById(item.productId)
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`)
    }

    if (!product.inStock) {
      throw new Error(`Product out of stock: ${product.name}`)
    }

    validatedItems.push({ product, quantity: item.quantity })
  }

  // Calculate subtotal (server-side)
  const subtotal = validatedItems.reduce(
    (total, { product, quantity }) => total + product.priceInCents * quantity,
    0
  )

  // Calculate delivery fee
  const deliveryOption = DELIVERY_OPTIONS[deliveryMethod]
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : deliveryOption.fee

  // Build line items for Stripe
  const lineItems = validatedItems.map(({ product, quantity }) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: product.name,
        description: product.description,
      },
      unit_amount: product.priceInCents,
    },
    quantity,
  }))

  // Add delivery as a line item if not free
  if (deliveryFee > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: deliveryOption.name,
          description: 'Delivery to your address',
        },
        unit_amount: deliveryFee,
      },
      quantity: 1,
    })
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: lineItems,
    mode: 'payment',
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU'],
    },
    phone_number_collection: {
      enabled: true,
    },
  })

  return session.client_secret
}

export async function getDeliveryOptions(subtotalInCents: number) {
  const isFreeDelivery = subtotalInCents >= FREE_DELIVERY_THRESHOLD

  return Object.entries(DELIVERY_OPTIONS).map(([id, option]) => ({
    id: id as DeliveryInfo['method'],
    name: option.name,
    fee: isFreeDelivery ? 0 : option.fee,
    isFree: isFreeDelivery,
  }))
}
