"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { MobileNav } from "@/components/mobile-nav"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ImageIcon, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CreatePostPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0])
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.content.trim()) return
    
    setIsLoading(true)
    
    // Simulate post creation - replace with real API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    router.push("/home")
  }

  const characterCount = formData.content.length
  const maxCharacters = 2000

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Back button */}
        <Link 
          href="/home"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle>Créer une publication</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Author preview */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-muted">JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Jean Dupont</p>
                  <p className="text-sm text-muted-foreground">@jeandupont</p>
                </div>
              </div>
              
              {/* Title (optional) */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre (optionnel)</Label>
                <Input
                  id="title"
                  placeholder="Donnez un titre à votre publication"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                />
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Contenu</Label>
                <Textarea
                  id="content"
                  placeholder="Que souhaitez-vous partager ?"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-[150px] resize-none"
                  maxLength={maxCharacters}
                  required
                />
                <div className="flex justify-end">
                  <span className={cn(
                    "text-xs",
                    characterCount > maxCharacters * 0.9
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}>
                    {characterCount}/{maxCharacters}
                  </span>
                </div>
              </div>
              
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Image (optionnel)</Label>
                
                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-lg border border-border">
                    <div className="relative aspect-video">
                      <Image
                        src={imagePreview}
                        alt="Aperçu"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Supprimer l'image</span>
                    </Button>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Glissez une image ici ou cliquez pour parcourir
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG, GIF jusqu'à 10MB
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !formData.content.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publication...
                  </>
                ) : (
                  "Publier"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
      
      <MobileNav />
    </div>
  )
}
