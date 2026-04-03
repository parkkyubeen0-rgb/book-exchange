import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { BookCard } from '@/components/book-card'
import { Button } from '@/components/ui/button'
import { Book } from '@/lib/types'
import { BookOpen, RefreshCw, Users, ArrowRight, Search } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch recent available books
  const { data: recentBooks } = await supabase
    .from('books')
    .select(`
      *,
      profiles:user_id (
        id,
        nickname
      )
    `)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              전자책을 교환하고
              <br />
              <span className="text-primary">새로운 이야기를</span> 만나세요
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
              BookSwap에서 가지고 있는 전자책을 등록하고 
              다른 사용자들과 교환하세요. 새로운 책을 발견하고 
              나만의 라이브러리를 확장해보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/browse">
                  <Search className="mr-2 h-5 w-5" />
                  책 탐색하기
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/sign-up">
                  무료로 시작하기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">책 등록</h3>
              <p className="text-muted-foreground text-sm">
                가지고 있는 전자책을 등록하고 다른 사용자에게 공개하세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <RefreshCw className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">교환 요청</h3>
              <p className="text-muted-foreground text-sm">
                원하는 책을 발견하면 나의 책을 제안하여 교환을 요청하세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">커뮤니티</h3>
              <p className="text-muted-foreground text-sm">
                책을 사랑하는 사람들과 함께 라이브러리를 확장해보세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Books Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                최근 등록된 책
              </h2>
              <p className="text-muted-foreground mt-1">
                새롭게 등록된 전자책을 확인해보세요
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/browse">
                전체 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recentBooks && recentBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recentBooks.map((book) => (
                <BookCard key={book.id} book={book as Book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/50 rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">아직 등록된 책이 없습니다</p>
              <Button asChild className="mt-4">
                <Link href="/my-books/new">첫 번째 책 등록하기</Link>
              </Button>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/browse">
                전체 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            무료로 가입하고 첫 번째 책을 등록해보세요. 
            새로운 책과의 만남이 기다리고 있습니다.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/sign-up">
              무료로 회원가입
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">BookSwap</span>
            </div>
            <p className="text-sm text-muted-foreground">
              전자책 교환 플랫폼
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
