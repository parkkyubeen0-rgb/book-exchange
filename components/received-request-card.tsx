'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExchangeRequest, EXCHANGE_STATUS_LABELS, GENRE_LABELS } from '@/lib/types'
import { BookOpen, ArrowRight, Check, X, Loader2, User, MessageSquare } from 'lucide-react'

interface ReceivedRequestCardProps {
  request: ExchangeRequest
}

export function ReceivedRequestCard({ request }: ReceivedRequestCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<'accept' | 'reject' | 'complete' | null>(null)

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  }

  async function handleAction(action: 'accept' | 'reject' | 'complete') {
    setIsLoading(action)
    const supabase = createClient()

    const newStatus = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'completed'

    await supabase
      .from('exchange_requests')
      .update({ status: newStatus })
      .eq('id', request.id)

    // If completed, mark both books as unavailable
    if (action === 'complete') {
      await supabase
        .from('books')
        .update({ is_available: false })
        .in('id', [request.requested_book_id, request.offered_book_id])
    }

    setIsLoading(null)
    router.refresh()
  }

  const createdDate = new Date(request.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{request.requester?.nickname}</span>
            <span className="text-xs text-muted-foreground">님의 요청</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{createdDate}</span>
            <Badge className={statusColors[request.status]}>
              {EXCHANGE_STATUS_LABELS[request.status]}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* My Book (Requested) */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-2">내 책</p>
            <Link href={`/books/${request.requested_book?.id}`} className="flex items-center gap-3 group">
              <div className="w-12 h-16 relative flex-shrink-0 bg-muted rounded overflow-hidden">
                {request.requested_book?.cover_url ? (
                  <Image
                    src={request.requested_book.cover_url}
                    alt={request.requested_book.title || ''}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm line-clamp-1 group-hover:text-primary">
                  {request.requested_book?.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {request.requested_book?.author}
                </p>
              </div>
            </Link>
          </div>

          <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

          {/* Their Book (Offered) */}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-2">교환 제안</p>
            <Link href={`/books/${request.offered_book?.id}`} className="flex items-center gap-3 group">
              <div className="w-12 h-16 relative flex-shrink-0 bg-muted rounded overflow-hidden">
                {request.offered_book?.cover_url ? (
                  <Image
                    src={request.offered_book.cover_url}
                    alt={request.offered_book.title || ''}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm line-clamp-1 group-hover:text-primary">
                  {request.offered_book?.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {request.offered_book?.author}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Message */}
        {request.message && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">{request.message}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        {request.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={() => handleAction('reject')}
              disabled={isLoading !== null}
            >
              {isLoading === 'reject' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" />
                  거절
                </>
              )}
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleAction('accept')}
              disabled={isLoading !== null}
            >
              {isLoading === 'accept' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  수락
                </>
              )}
            </Button>
          </div>
        )}

        {request.status === 'accepted' && (
          <div className="mt-4">
            <Button
              size="sm"
              className="w-full"
              onClick={() => handleAction('complete')}
              disabled={isLoading !== null}
            >
              {isLoading === 'complete' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  교환 완료
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
