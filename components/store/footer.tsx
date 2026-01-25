import Link from 'next/link'
import { Store } from 'lucide-react'
import { CATEGORIES } from '@/lib/products'

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">FreshMart</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Your trusted online grocery store. We deliver fresh produce, quality meats, 
              and pantry essentials right to your doorstep.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-foreground">Categories</h3>
            <ul className="mt-4 space-y-2">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.id}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Contact: support@freshmart.com
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Phone: (555) 123-4567
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            {new Date().getFullYear()} FreshMart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
