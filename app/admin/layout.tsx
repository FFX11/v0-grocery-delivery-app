import React from "react"
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superuser')) {
    redirect('/?error=unauthorized')
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar profile={profile} />
      <main className="flex-1 overflow-auto bg-muted/30 p-6">{children}</main>
    </div>
  )
}
