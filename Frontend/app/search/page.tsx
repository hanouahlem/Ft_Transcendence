"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { PostCard } from "@/components/post-card"
import { UserCard } from "@/components/user-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockPosts, mockUsers, trendingTopics } from "@/lib/mock-data"
import { Search, TrendingUp, X } from "lucide-react"

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const initialTab = searchParams.get("tab") || "all"
  
  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "design", "next.js", "startup"
  ])

  // Filter results based on query
  const filteredPosts = mockPosts.filter(post => 
    post.title.toLowerCase().includes(query.toLowerCase()) ||
    post.content.toLowerCase().includes(query.toLowerCase())
  )
  
  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(query.toLowerCase()) ||
    user.username.toLowerCase().includes(query.toLowerCase()) ||
    user.bio?.toLowerCase().includes(query.toLowerCase())
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches([query.trim(), ...recentSearches.slice(0, 4)])
    }
  }

  const clearSearch = () => {
    setQuery("")
  }

  const removeRecentSearch = (search: string) => {
    setRecentSearches(recentSearches.filter(s => s !== search))
  }

  const hasResults = filteredPosts.length > 0 || filteredUsers.length > 0

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher des publications ou des utilisateurs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Effacer</span>
          </Button>
        )}
      </form>

      {query ? (
        /* Search Results */
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b bg-transparent p-0">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Tout
            </TabsTrigger>
            <TabsTrigger 
              value="posts" 
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Publications ({filteredPosts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Utilisateurs ({filteredUsers.length})
            </TabsTrigger>
          </TabsList>

          {!hasResults && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">Aucun résultat</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Aucun résultat pour "{query}". Essayez une autre recherche.
              </p>
            </div>
          )}

          <TabsContent value="all" className="mt-6 space-y-6">
            {filteredUsers.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Utilisateurs
                </h3>
                <div className="space-y-2">
                  {filteredUsers.slice(0, 3).map((user) => (
                    <UserCard key={user.id} user={user} variant="compact" />
                  ))}
                  {filteredUsers.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-muted-foreground"
                      onClick={() => setActiveTab("users")}
                    >
                      Voir tous les utilisateurs
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {filteredPosts.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Publications
                </h3>
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-6 space-y-4">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>

          <TabsContent value="users" className="mt-6 space-y-3">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </TabsContent>
        </Tabs>
      ) : (
        /* Default View - Trending & Recent Searches */
        <div className="space-y-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recherches récentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {recentSearches.map((search) => (
                  <div 
                    key={search}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
                  >
                    <button
                      onClick={() => setQuery(search)}
                      className="flex-1 text-left text-sm"
                    >
                      {search}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeRecentSearch(search)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Trending Topics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Tendances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTopics.map((topic) => (
                <button
                  key={topic.tag}
                  onClick={() => setQuery(topic.tag.replace("#", ""))}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted"
                >
                  <span className="font-medium">{topic.tag}</span>
                  <span className="text-sm text-muted-foreground">
                    {topic.posts.toLocaleString("fr-FR")} posts
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Suggested Users */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockUsers.slice(0, 4).map((user) => (
                <UserCard key={user.id} user={user} variant="compact" />
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <Suspense fallback={
        <main className="mx-auto max-w-3xl px-4 py-6">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        </main>
      }>
        <SearchContent />
      </Suspense>
      <MobileNav />
    </div>
  )
}
