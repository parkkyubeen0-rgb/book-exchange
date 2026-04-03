'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, BookOpen, Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    if (nickname.length < 2) {
      setError('닉네임은 최소 2자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/auth/callback`,
        data: {
          nickname,
        },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('이미 등록된 이메일입니다.')
      } else {
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
      setIsLoading(false)
      return
    }

    router.push('/auth/sign-up-success')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <BookOpen className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-foreground">BookSwap</span>
          </Link>
          <p className="text-muted-foreground text-center">
            전자책 교환 플랫폼
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">회원가입</CardTitle>
            <CardDescription>
              새 계정을 만들어 책 교환을 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="다른 사용자에게 표시될 이름"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="최소 6자 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    회원가입 중...
                  </>
                ) : (
                  '회원가입'
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                이미 계정이 있으신가요?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-primary hover:underline font-medium"
                >
                  로그인
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
