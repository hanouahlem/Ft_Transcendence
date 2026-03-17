import { PostCard } from "@/components/post-card"
import { UserCard } from "@/components/user-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockPosts, mockUsers, trendingTopics } from "@/lib/mock-data"
import Link from "next/link"
import { TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Feed principal */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Fil d'actualité</h1>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="text-sm">
                  Pour vous
                </Button>
                <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
                  Suivis
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {mockPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            
            <div className="flex justify-center py-8">
              <Button variant="outline">Charger plus</Button>
            </div>
          </div>
          
          {/* Sidebar */}
          <aside className="hidden space-y-6 lg:block">
            {/* Trending */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Tendances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic) => (
                  <Link 
                    key={topic.tag} 
                    href={`/search?q=${encodeURIComponent(topic.tag)}`}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
                  >
                    <span className="font-medium">{topic.tag}</span>
                    <span className="text-sm text-muted-foreground">
                      {topic.posts.toLocaleString("fr-FR")} posts
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
            
            {/* Suggestions d'amis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {mockUsers.filter(u => !u.isFriend).slice(0, 3).map((user) => (
                  <UserCard key={user.id} user={user} variant="compact" />
                ))}
                <Link href="/search?tab=users" className="block">
                  <Button variant="ghost" size="sm" className="mt-2 w-full text-muted-foreground">
                    Voir plus
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Footer */}
            <div className="text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <Link href="/about" className="hover:underline">À propos</Link>
                <Link href="/terms" className="hover:underline">Conditions</Link>
                <Link href="/privacy" className="hover:underline">Confidentialité</Link>
                <Link href="/help" className="hover:underline">Aide</Link>
              </div>
              <p className="mt-2">© 2026 Transcendence</p>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}
