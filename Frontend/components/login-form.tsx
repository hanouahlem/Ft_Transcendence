"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field"
import { FtInput, FtInputLabel } from "@/components/ui/ft-input"
import { FtHighlight } from "@/components/ui/ft-highlight"
import { loginUser } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 1. Send credentials to backend POST /login
      const data = await loginUser({ identifier, password })

      // 2. Store token + fetch user info via AuthContext
      await login(data.token)

      // 3. Redirect to home
      router.push("/")
    } catch (err) {
      // 4. Show backend error message
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-serif text-4xl leading-none">Login to your account</h1>
            <p className="text-[0.75rem] uppercase font-medium tracking-[0.02em] text-muted-foreground">
              Enter your email below to login
            </p>
          </div>

          {error && (
            <div className="border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Field>
            <FtInputLabel htmlFor="identifier">Username or Email</FtInputLabel>
            <FtInput
              id="identifier"
              type="text"
              placeholder="user@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </Field>
          <Field>
            <div className="flex items-center">
              <FtInputLabel htmlFor="password">Access Phrase</FtInputLabel>
              <a
                href="#"
                className="ml-auto text-[0.65rem] uppercase font-semibold tracking-widest underline-offset-4 hover:underline"
              >
                Forgot?
              </a>
            </div>
            <FtInput
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Field>
            <Button type="submit" disabled={loading}>
              {loading ? "Connecting..." : "Login"}
            </Button>
          </Field>
          <FieldSeparator className="text-[0.75rem] uppercase font-medium tracking-[0.02em]">Or continue with</FieldSeparator>
          <Field>
            <Button variant="outline" type="button" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                />
              </svg>
              Login with GitHub
            </Button>
            <FieldDescription className="text-center text-[0.75rem] uppercase font-medium tracking-[0.02em]">
              Don&apos;t have an account?{" "}
              <a href="/signup">
                <FtHighlight>Sign up</FtHighlight>
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
