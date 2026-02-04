'use client'

import Image from 'next/image'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  email: string | null
  name: string | null
  image: string | null
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  lastLoginAt: Date | null
}

interface UserManagementProps {
  users: User[]
}

export function UserManagement({ users }: UserManagementProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>No users found</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {user.image && (
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span>{user.name || 'Anonymous'}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.status === 'active'
                      ? 'default'
                      : user.status === 'suspended'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                {user.lastLoginAt
                  ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                  : 'Never'}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
