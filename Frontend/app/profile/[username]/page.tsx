"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { PostCard } from "@/components/post-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { mockPosts, mockUsers } from "@/lib/mock-data"
import { CalendarDays, MapPin, Link as LinkIcon, UserPlus, UserCheck, Settings, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  
  // Mock user data - in real app, fetch from API
  const user = mockUsers.find(u => u.username === username) || {
    id: "current",
    name: "Jean Dupont",
    username: username,
    avatar: null,
    initials: "JD",
    bio: "Développeur passionné et créateur de contenu. J'aime partager mes découvertes et apprendre de la communauté.",
    followers: 1250,
    isFriend: false,
  }
  
  const isCurrentUser = username === "jeandupont"
  const [isFriend, setIsFriend] = useState(user.isFriend ?? false)
  
  // Filter posts by this user
  const userPosts = mockPosts.filter(p => p.author.username === username)
  
  const stats = {
    posts: userPosts.length || 12,
    followers: user.followers || 1250,
    following: 340,
    friends: 89,
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <main className="mx-auto max-w-4xl">
        {/* Cover & Avatar */}
        <div className="relative">
          <div className="h-32 bg-muted sm:h-48 md:h-56">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
          </div>
          
          <div className="px-4">
            <div className="relative -mt-16 flex flex-col items-start gap-4 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
              <Avatar className="h-28 w-28 border-4 border-background sm:h-36 sm:w-36">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-muted text-2xl">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-2 sm:mb-2">
                {isCurrentUser ? (
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Modifier le profil
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button
                      variant={isFriend ? "secondary" : "default"}
                      size="sm"
                      onClick={() => setIsFriend(!isFriend)}
                    >
                      {isFriend ? (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Ami
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Ajouter
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Signaler</DropdownMenuItem>
                        <DropdownMenuItem>Bloquer</DropdownMenuItem>
                        <DropdownMenuItem>Copier le lien</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="mt-4 space-y-3">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>
              
              {user.bio && (
                <p className="text-foreground leading-relaxed">{user.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Paris, France
                </span>
                <span className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  <a href="#" className="text-foreground hover:underline">monsite.com</a>
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  Membre depuis janvier 2024
                </span>
              </div>
              
              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <span>
                  <strong className="font-semibold">{stats.posts}</strong>{" "}
                  <span className="text-muted-foreground">publications</span>
                </span>
                <span>
                  <strong className="font-semibold">{stats.followers.toLocaleString("fr-FR")}</strong>{" "}
                  <span className="text-muted-foreground">abonnés</span>
                </span>
                <span>
                  <strong className="font-semibold">{stats.following}</strong>{" "}
                  <span className="text-muted-foreground">abonnements</span>
                </span>
                <span>
                  <strong className="font-semibold">{stats.friends}</strong>{" "}
                  <span className="text-muted-foreground">amis</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Tabs */}
        <div className="mt-6 px-4">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-start border-b bg-transparent p-0">
              <TabsTrigger 
                value="posts" 
                className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Publications
              </TabsTrigger>
              <TabsTrigger 
                value="likes" 
                className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                J'aime
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Sauvegardés
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-6 space-y-4">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">Aucune publication pour le moment</p>
                    {isCurrentUser && (
                      <Link href="/create-post" className="mt-4">
                        <Button>Créer votre première publication</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="likes" className="mt-6 space-y-4">
              {mockPosts.filter(p => p.isLiked).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </TabsContent>
            
            <TabsContent value="saved" className="mt-6 space-y-4">
              {mockPosts.filter(p => p.isSaved).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <MobileNav />
    </div>
  )
}
