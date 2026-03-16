"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, UserCheck } from "lucide-react"

export interface User {
  id: string
  name: string
  username: string
  avatar: string | null
  initials: string
  bio?: string
  followers?: number
  isFriend?: boolean
}

interface UserCardProps {
  user: User
  variant?: "default" | "compact"
}

export function UserCard({ user, variant = "default" }: UserCardProps) {
  const [isFriend, setIsFriend] = useState(user.isFriend ?? false)

  const handleFriend = () => {
    setIsFriend(!isFriend)
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted">
        <Link href={`/profile/${user.username}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-secondary text-sm">
              {user.initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link 
            href={`/profile/${user.username}`}
            className="block truncate font-medium hover:underline"
          >
            {user.name}
          </Link>
          <p className="truncate text-sm text-muted-foreground">
            @{user.username}
          </p>
        </div>
        <Button
          variant={isFriend ? "secondary" : "default"}
          size="sm"
          onClick={handleFriend}
        >
          {isFriend ? (
            <>
              <UserCheck className="mr-1 h-4 w-4" />
              Ami
            </>
          ) : (
            <>
              <UserPlus className="mr-1 h-4 w-4" />
              Ajouter
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Link href={`/profile/${user.username}`}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-secondary">
                {user.initials}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link 
                  href={`/profile/${user.username}`}
                  className="block truncate font-medium hover:underline"
                >
                  {user.name}
                </Link>
                <p className="truncate text-sm text-muted-foreground">
                  @{user.username}
                </p>
              </div>
              <Button
                variant={isFriend ? "secondary" : "default"}
                size="sm"
                onClick={handleFriend}
                className="shrink-0"
              >
                {isFriend ? (
                  <>
                    <UserCheck className="mr-1 h-4 w-4" />
                    Ami
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-1 h-4 w-4" />
                    Ajouter
                  </>
                )}
              </Button>
            </div>
            {user.bio && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {user.bio}
              </p>
            )}
            {user.followers !== undefined && (
              <p className="mt-2 text-xs text-muted-foreground">
                {user.followers.toLocaleString("fr-FR")} abonnés
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
