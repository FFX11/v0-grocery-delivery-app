import Link from 'next/link'
import { Truck, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Fresh Groceries
            <br />
            <span className="text-primary">Delivered to Your Door</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Shop from our selection of fresh produce, quality meats, and pantry essentials. 
            Get everything you need with fast, reliable delivery.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/category/groceries">
              <Button size="lg" className="text-base">
                Shop Groceries
              </Button>
            </Link>
            <Link href="/category/meat">
              <Button size="lg" variant="outline" className="text-base bg-transparent">
                Browse Meats
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-card-foreground">Free Delivery</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Free delivery on orders over $50
            </p>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-card-foreground">Fast Shipping</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Same-day delivery available
            </p>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold text-card-foreground">Quality Guaranteed</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Fresh products or your money back
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
