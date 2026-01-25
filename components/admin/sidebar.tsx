'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tags,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Profile } from '@/lib/types/database'

interface AdminSidebarProps {
  profile: Profile
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: Tags,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    superuserOnly: true,
  },
]

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()
  const isSuperuser = profile.role === 'superuser'

  const filteredItems = navItems.filter(
    (item) => !item.superuserOnly || isSuperuser
  )

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-background lg:flex">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm">Back to Store</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Admin Panel
          </p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-sm font-medium">{profile.full_name || profile.email}</p>
            <Badge variant="secondary" className="text-xs">
              {profile.role}
            </Badge>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2',
                    isActive && 'bg-secondary'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
