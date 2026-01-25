'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '@/app/actions/orders'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { OrderStatus } from '@/lib/types/database'

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: OrderStatus
}

const statuses: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === currentStatus) return

    setIsUpdating(true)
    const result = await updateOrderStatus(orderId, newStatus)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Order status updated')
      router.refresh()
    }

    setIsUpdating(false)
  }

  return (
    <Select
      value={currentStatus}
      onValueChange={(value) => handleStatusChange(value as OrderStatus)}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
