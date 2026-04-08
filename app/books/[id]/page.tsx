import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { ExchangeRequestButton } from '@/components/exchange-request-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Book, GENRE_LABELS } from '@/lib/types'
import { BookOpen, User, Calendar, ArrowLeft } from 'lucide-react'

interface BookDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: book, error } = await supabase
    .from('books')
    .select(`
      *,
      profiles:user_id (
        id,
        nickname
      )
    `)
    .eq('id', id)
    .single()

  if (error || !book) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwner = user?.id === book.user_id
  const typedBook = book as Book

  // Format date
  const createdDate = new Date(book.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/browse">
            <ArrowLeft className="mr-2 h-4 w-4" />
            책 탐색으로 돌아가기
          </Link>
        </Button>

        <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] gap-8">
          {/* Book Cover */}
          <div>
            <Card className="overflow-hidden">
              <div className="aspect-[3/4] relative bg-muted">
                {book.cover_url ? (
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 350px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Book Info */}
          <div>
            <Badge variant="secondary" className="mb-3">
              {GENRE_LABELS[typedBook.genre]}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {book.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              {book.author}
            </p>

            <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
              {book.profiles && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>소유자: {book.profiles.nickname}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>등록일: {createdDate}</span>
              </div>
            </div>

            {/* Availability Status */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">교환 상태</p>
                    <p className={`font-semibold ${book.is_available ? 'text-accent' : 'text-muted-foreground'}`}>
                      {book.is_available ? '교환 가능' : '교환 불가'}
                    </p>
                  </div>
                  {!isOwner && book.is_available && user && (
                    <ExchangeRequestButton 
                      requestedBookId={book.id} 
                      ownerId={book.user_id}
                    />
                  )}
                  {!isOwner && book.is_available && !user && (
                    <Button asChild>
                      <Link href={`/auth/login?redirectTo=/books/${book.id}`}>
                        로그인하여 교환 요청
                      </Link>
                    </Button>
                  )}
                  {isOwner && (
                    <div className="flex flex-wrap gap-3">
                      {book.file_url && (
                        <Button variant="secondary" asChild>
                          <Link href={`/api/books/${book.id}/download`} target="_blank">
                            다운로드
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" asChild>
                        <Link href={`/my-books/${book.id}/edit`}>
                          수정하기
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {book.description && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">책 소개</h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
