"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { Comment, CommentData } from "@/components/comment"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { mockPosts, mockUsers } from "@/lib/mock-data"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ArrowLeft, Send } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Mock comments
const mockComments: CommentData[] = [
  {
    id: "c1",
    author: mockUsers[1],
    content: "Excellent article ! J'adore ta perspective sur le minimalisme. C'est exactement ce dont notre industrie a besoin.",
    likes: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    isLiked: true,
    replies: [
      {
        id: "c1r1",
        author: mockUsers[0],
        content: "Merci beaucoup ! Content que ça te parle.",
        likes: 3,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isLiked: false,
      }
    ]
  },
  {
    id: "c2",
    author: mockUsers[2],
    content: "Est-ce que tu pourrais développer sur les outils que tu utilises au quotidien ? Je serais curieuse de connaître ton workflow.",
    likes: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    isLiked: false,
  },
  {
    id: "c3",
    author: mockUsers[3],
    content: "Je partage totalement cette vision. Le minimalisme dans le design, c'est aussi du respect pour l'attention de l'utilisateur.",
    likes: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    isLiked: false,
  },
]

export default function PostPage() {
  const params = useParams()
  const postId = params.id as string
  
  // Find the post
  const post = mockPosts.find(p => p.id === postId) || mockPosts[0]
  
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false)
  const [likes, setLikes] = useState(post.likes)
  const [isSaved, setIsSaved] = useState(post.isSaved ?? false)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState(mockComments)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    
    const newComment: CommentData = {
      id: `c${Date.now()}`,
      author: {
        name: "Jean Dupont",
        username: "jeandupont",
        avatar: null,
        initials: "JD",
      },
      content: comment,
      likes: 0,
      createdAt: new Date().toISOString(),
      isLiked: false,
    }
    
    setComments([newComment, ...comments])
    setComment("")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Back button */}
        <Link 
          href="/home"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        
        <Card>
          <CardHeader className="flex flex-row items-start gap-3 p-4 sm:p-6">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar ?? undefined} alt={post.author.name} />
                <AvatarFallback className="bg-muted">
                  {post.author.initials}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <Link 
                    href={`/profile/${post.author.username}`}
                    className="font-medium hover:underline"
                  >
                    {post.author.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    @{post.author.username}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-4 sm:px-6">
            {post.title && (
              <h1 className="mb-4 text-2xl font-bold leading-tight sm:text-3xl">
                {post.title}
              </h1>
            )}
            
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
              {post.content}
            </p>

            {post.image && (
              <div className="mt-4 overflow-hidden rounded-lg">
                <div className="relative aspect-video bg-muted">
                  <Image
                    src={post.image}
                    alt={post.title || "Image du post"}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            
            <p className="mt-4 text-sm text-muted-foreground">
              {formatDate(post.createdAt)}
            </p>
          </CardContent>

          <Separator />

          <CardFooter className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2",
                  isLiked && "text-red-500"
                )}
                onClick={handleLike}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                <span>{likes}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                <span>{comments.length}</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Partager</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(isSaved && "text-foreground")}
                onClick={handleSave}
              >
                <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
                <span className="sr-only">Sauvegarder</span>
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Comments Section */}
        <div id="comments" className="mt-6 space-y-6">
          <h2 className="text-lg font-semibold">
            Commentaires ({comments.length})
          </h2>
          
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-muted">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Écrire un commentaire..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={!comment.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  Publier
                </Button>
              </div>
            </div>
          </form>
          
          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((c) => (
              <Comment 
                key={c.id} 
                comment={c}
                onReply={(id) => {
                  // In a real app, this would open a reply input
                  console.log("Reply to:", id)
                }}
              />
            ))}
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  )
}
