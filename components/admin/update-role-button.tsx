'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/types/database'

interface UpdateRoleButtonProps {
  userId: string
  currentRole: UserRole
}

const roles: { value: UserRole; label: string }[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'admin', label: 'Admin' },
  { value: 'superuser', label: 'Superuser' },
]

export function UpdateRoleButton({ userId, currentRole }: UpdateRoleButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === currentRole) return

    setIsUpdating(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to update role')
    } else {
      toast.success(`Role updated to ${newRole}`)
      router.refresh()
    }

    setIsUpdating(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isUpdating} className="gap-1 bg-transparent">
          {isUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              Change Role
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onClick={() => handleRoleChange(role.value)}
            className={currentRole === role.value ? 'bg-muted' : ''}
          >
            {role.label}
            {currentRole === role.value && ' (current)'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
