'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Book } from '@/lib/types'
import { RefreshCw, Loader2, AlertCircle } from 'lucide-react'

interface ExchangeRequestButtonProps {
  requestedBookId: string
  ownerId: string
}

export function ExchangeRequestButton({ requestedBookId, ownerId }: ExchangeRequestButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [myBooks, setMyBooks] = useState<Book[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingBooks, setIsFetchingBooks] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMyBooks() {
      if (!isOpen) return
      
      setIsFetchingBooks(true)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: books } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_available', true)

      setMyBooks(books || [])
      setIsFetchingBooks(false)
    }

    fetchMyBooks()
  }, [isOpen])

  async function handleSubmit() {
    if (!selectedBookId) {
      setError('교환할 책을 선택해주세요.')
      return
    }

    setError(null)
    setIsLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('로그인이 필요합니다.')
      setIsLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('exchange_requests')
      .insert({
        requester_id: user.id,
        owner_id: ownerId,
        requested_book_id: requestedBookId,
        offered_book_id: selectedBookId,
        message: message || null,
      })

    if (insertError) {
      if (insertError.message.includes('duplicate')) {
        setError('이미 이 책에 대한 교환 요청이 있습니다.')
      } else {
        setError('교환 요청 중 오류가 발생했습니다.')
      }
      setIsLoading(false)
      return
    }

    setIsOpen(false)
    router.push('/exchanges?tab=sent')
    router.refresh()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          교환 요청
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>교환 요청하기</DialogTitle>
          <DialogDescription>
            이 책과 교환할 내 책을 선택하고 메시지를 남겨주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="book">교환할 내 책 선택</Label>
            {isFetchingBooks ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                책 목록을 불러오는 중...
              </div>
            ) : myBooks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                교환 가능한 책이 없습니다. 먼저 책을 등록해주세요.
              </p>
            ) : (
              <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                <SelectTrigger>
                  <SelectValue placeholder="책 선택..." />
                </SelectTrigger>
                <SelectContent>
                  {myBooks.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} - {book.author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="message">메시지 (선택)</Label>
            <Textarea
              id="message"
              placeholder="상대방에게 전할 메시지를 입력하세요..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading || myBooks.length === 0}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                요청 중...
              </>
            ) : (
              '교환 요청 보내기'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
