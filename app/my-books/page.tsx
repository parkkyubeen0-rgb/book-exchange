import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { MyBookCard } from '@/components/my-book-card'
import { Button } from '@/components/ui/button'
import { Book } from '@/lib/types'
import { Plus, BookOpen } from 'lucide-react'

export default async function MyBooksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/my-books')
  }

  const { data: books } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">내 책 관리</h1>
            <p className="text-muted-foreground mt-1">
              등록한 책을 관리하고 새 책을 추가하세요
            </p>
          </div>
          <Button asChild>
            <Link href="/my-books/new">
              <Plus className="mr-2 h-4 w-4" />
              새 책 등록
            </Link>
          </Button>
        </div>

        {books && books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <MyBookCard key={book.id} book={book as Book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/50 rounded-lg">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              아직 등록된 책이 없습니다
            </h2>
            <p className="text-muted-foreground mb-4">
              첫 번째 책을 등록하고 교환을 시작하세요
            </p>
            <Button asChild>
              <Link href="/my-books/new">
                <Plus className="mr-2 h-4 w-4" />
                새 책 등록
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
