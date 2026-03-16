"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MoreHorizontal, Reply } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface CommentData {
  id: string
  author: {
    name: string
    username: string
    avatar: string | null
    initials: string
  }
  content: string
  likes: number
  createdAt: string
  isLiked?: boolean
  replies?: CommentData[]
}

interface CommentProps {
  comment: CommentData
  onReply?: (commentId: string) => void
}

export function Comment({ comment, onReply }: CommentProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked ?? false)
  const [likes, setLikes] = useState(comment.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return "À l'instant"
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}j`
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  return (
    <div className="flex gap-3">
      <Link href={`/profile/${comment.author.username}`} className="shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar ?? undefined} alt={comment.author.name} />
          <AvatarFallback className="bg-muted text-xs">
            {comment.author.initials}
          </AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="rounded-lg bg-muted px-3 py-2">
            <div className="flex items-center gap-2">
              <Link 
                href={`/profile/${comment.author.username}`}
                className="text-sm font-medium hover:underline"
              >
                {comment.author.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed">{comment.content}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Signaler</DropdownMenuItem>
              <DropdownMenuItem>Masquer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-4 pl-2">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
            {likes > 0 && <span>{likes}</span>}
          </button>
          
          {onReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Reply className="h-3.5 w-3.5" />
              Répondre
            </button>
          )}
        </div>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l-2 border-muted pl-4">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
