"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { SignupForm } from "@/components/signup-form"
import { GalleryVerticalEndIcon } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function SignupPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoggedIn) router.push("/")
  }, [isLoggedIn, router])
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/images/hoang-mai-nguyen-QNTXk3lCnlA-unsplash.jpg"
          alt="Signup illustration"
          fill
          className="object-cover grayscale"
        />
      </div>
    </div>
  )
}
