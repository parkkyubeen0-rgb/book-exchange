'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BookOpen, Menu, X, User as UserIcon, LogOut, Library, RefreshCw } from 'lucide-react'

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [nickname, setNickname] = useState<string>('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        setNickname(user.user_metadata?.nickname || '사용자')
      }
      setIsLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setNickname(session.user.user_metadata?.nickname || '사용자')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/browse', label: '책 탐색' },
    { href: '/my-books', label: '내 책 관리', protected: true },
    { href: '/exchanges', label: '교환 요청', protected: true },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">BookSwap</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              if (link.protected && !user) return null
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-9 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{nickname}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/my-books" className="flex items-center gap-2">
                      <Library className="h-4 w-4" />
                      내 책 관리
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/exchanges" className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      교환 요청
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">로그인</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">회원가입</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                if (link.protected && !user) return null
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
              
              <div className="border-t border-border mt-2 pt-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {nickname}님으로 로그인
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full px-3 py-2 text-sm font-medium text-destructive hover:bg-muted rounded-md text-left transition-colors"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-3">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                        로그인
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/auth/sign-up" onClick={() => setIsMenuOpen(false)}>
                        회원가입
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
