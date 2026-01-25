import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

async function getDashboardStats() {
  const supabase = await createClient()

  const [productsResult, ordersResult, usersResult] = await Promise.all([
    supabase.from('products').select('id, in_stock', { count: 'exact' }),
    supabase.from('orders').select('id, total, status, created_at'),
    supabase.from('profiles').select('id', { count: 'exact' }),
  ])

  const products = productsResult.data || []
  const orders = ordersResult.data || []
  const totalUsers = usersResult.count || 0

  const totalProducts = productsResult.count || 0
  const outOfStock = products.filter((p) => !p.in_stock).length
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)

  // Recent orders (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const recentOrders = orders.filter(
    (o) => new Date(o.created_at) > weekAgo
  ).length

  return {
    totalProducts,
    outOfStock,
    totalOrders,
    pendingOrders,
    totalRevenue,
    totalUsers,
    recentOrders,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      description: `${stats.outOfStock} out of stock`,
      icon: Package,
      alert: stats.outOfStock > 0,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      description: `${stats.pendingOrders} pending`,
      icon: ShoppingBag,
      alert: stats.pendingOrders > 0,
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue / 100).toFixed(2)}`,
      description: 'All time',
      icon: DollarSign,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'Registered accounts',
      icon: Users,
    },
    {
      title: 'Recent Orders',
      value: stats.recentOrders,
      description: 'Last 7 days',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.alert && (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <a
              href="/admin/products/new"
              className="flex items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
            >
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Add New Product</p>
                <p className="text-sm text-muted-foreground">
                  Create a new product listing
                </p>
              </div>
            </a>
            <a
              href="/admin/orders"
              className="flex items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
            >
              <ShoppingBag className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">View Orders</p>
                <p className="text-sm text-muted-foreground">
                  Manage customer orders
                </p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current store status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Store Status</span>
              <span className="flex items-center gap-2 text-sm font-medium text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Payment Processing</span>
              <span className="flex items-center gap-2 text-sm font-medium text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Products Out of Stock</span>
              <span className={`text-sm font-medium ${stats.outOfStock > 0 ? 'text-amber-500' : 'text-primary'}`}>
                {stats.outOfStock}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
