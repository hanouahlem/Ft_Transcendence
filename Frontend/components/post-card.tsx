"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface Post {
  id: string
  author: {
    name: string
    username: string
    avatar: string | null
    initials: string
  }
  title: string
  content: string
  image?: string
  likes: number
  comments: number
  createdAt: string
  isLiked?: boolean
  isSaved?: boolean
}

interface PostCardProps {
  post: Post
  variant?: "default" | "compact"
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false)
  const [likes, setLikes] = useState(post.likes)
  const [isSaved, setIsSaved] = useState(post.isSaved ?? false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return "À l'instant"
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  return (
    <Card className="overflow-hidden border-border transition-shadow hover:shadow-sm">
      <CardHeader className="flex flex-row items-start gap-3 p-4">
        <Link href={`/profile/${post.author.username}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar ?? undefined} alt={post.author.name} />
            <AvatarFallback className="bg-muted text-sm">
              {post.author.initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link 
                href={`/profile/${post.author.username}`}
                className="font-medium hover:underline"
              >
                {post.author.name}
              </Link>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(post.createdAt)}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Plus d'options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Signaler</DropdownMenuItem>
                <DropdownMenuItem>Masquer</DropdownMenuItem>
                <DropdownMenuItem>Copier le lien</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Link 
            href={`/profile/${post.author.username}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            @{post.author.username}
          </Link>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3">
        <Link href={`/post/${post.id}`} className="block">
          {post.title && (
            <h3 className="mb-2 text-lg font-semibold leading-tight hover:underline">
              {post.title}
            </h3>
          )}
          <p className={cn(
            "text-foreground leading-relaxed",
            variant === "compact" && "line-clamp-3"
          )}>
            {post.content}
          </p>
        </Link>

        {post.image && (
          <Link href={`/post/${post.id}`} className="mt-3 block">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <Image
                src={post.image}
                alt={post.title || "Image du post"}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
            </div>
          </Link>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 text-muted-foreground",
              isLiked && "text-red-500"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span className="text-sm">{likes}</span>
          </Button>
          <Link href={`/post/${post.id}#comments`}>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments}</span>
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Partager</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-muted-foreground",
              isSaved && "text-foreground"
            )}
            onClick={handleSave}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
            <span className="sr-only">Sauvegarder</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
