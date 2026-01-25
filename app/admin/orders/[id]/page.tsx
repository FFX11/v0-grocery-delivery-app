import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Package, Truck, User, CreditCard } from 'lucide-react'
import { OrderStatusSelect } from '@/components/admin/order-status-select'
import type { OrderStatus } from '@/lib/types/database'

async function getOrder(id: string) {
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) return null

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  return { ...order, items: items || [] }
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Order Details
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              {order.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={statusColors[order.status as OrderStatus]}>
            {statusLabels[order.status as OrderStatus]}
          </Badge>
          <OrderStatusSelect
            orderId={order.id}
            currentStatus={order.status}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} x ${(item.product_price / 100).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${((item.product_price * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${(order.subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>
                      {order.delivery_fee > 0
                        ? `$${(order.delivery_fee / 100).toFixed(2)}`
                        : 'Free'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${(order.total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{order.customer_name || 'Guest'}</p>
              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
              {order.customer_phone && (
                <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium capitalize">
                {order.delivery_option?.replace('-', ' ') || 'Standard'}
              </p>
              {order.delivery_address && (
                <p className="text-sm text-muted-foreground">
                  {order.delivery_address}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">Stripe</p>
              {order.stripe_session_id && (
                <p className="font-mono text-xs text-muted-foreground truncate">
                  {order.stripe_session_id}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
