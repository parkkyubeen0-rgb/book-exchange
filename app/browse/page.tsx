import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { BookCard } from '@/components/book-card'
import { BrowseFilters } from '@/components/browse-filters'
import { Book, BookGenre, GENRE_LABELS } from '@/lib/types'
import { BookOpen } from 'lucide-react'

interface BrowsePageProps {
  searchParams: Promise<{
    search?: string
    genre?: string
  }>
}

async function BookGrid({ search, genre }: { search?: string; genre?: string }) {
  const supabase = await createClient()

  let query = supabase
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

  if (search) {
    query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`)
  }

  if (genre && genre !== 'all') {
    query = query.eq('genre', genre)
  }

  const { data: books, error } = await query

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive">책을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    )
  }

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/50 rounded-lg">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {search || genre ? '검색 결과가 없습니다' : '등록된 책이 없습니다'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book as Book} />
      ))}
    </div>
  )
}

function BookGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-muted rounded-lg" />
          <div className="mt-3 h-4 bg-muted rounded w-16" />
          <div className="mt-2 h-5 bg-muted rounded w-full" />
          <div className="mt-1 h-4 bg-muted rounded w-2/3" />
        </div>
      ))}
    </div>
  )
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams
  const { search, genre } = params

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">책 탐색</h1>
          <p className="text-muted-foreground">
            교환 가능한 전자책을 찾아보세요
          </p>
        </div>

        <div className="mb-8">
          <BrowseFilters 
            currentSearch={search} 
            currentGenre={genre as BookGenre | undefined} 
          />
        </div>

        <Suspense fallback={<BookGridSkeleton />}>
          <BookGrid search={search} genre={genre} />
        </Suspense>
      </main>
    </div>
  )
}
