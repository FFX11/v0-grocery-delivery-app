import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="rounded-full bg-muted p-6">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-foreground">Page Not Found</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. The product may have been 
        removed or the link might be incorrect.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/">
          <Button size="lg">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
