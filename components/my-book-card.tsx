'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Book, GENRE_LABELS } from '@/lib/types'
import { BookOpen, Pencil, Trash2, Eye, EyeOff, Loader2, Download } from 'lucide-react'

interface MyBookCardProps {
  book: Book
}

export function MyBookCard({ book }: MyBookCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const supabase = createClient()

    // Delete cover image if exists
    if (book.cover_url) {
      const coverPath = book.cover_url.split('/').pop()
      if (coverPath) {
        await supabase.storage.from('book-covers').remove([`${book.user_id}/${coverPath}`])
      }
    }

    // Delete ebook file if exists
    if (book.file_url) {
      const filePath = book.file_url.split('/').pop()
      if (filePath) {
        await supabase.storage.from('ebook-files').remove([`${book.user_id}/${filePath}`])
      }
    }

    await supabase.from('books').delete().eq('id', book.id)

    router.refresh()
  }

  async function handleToggleAvailability() {
    setIsToggling(true)
    const supabase = createClient()

    await supabase
      .from('books')
      .update({ is_available: !book.is_available })
      .eq('id', book.id)

    setIsToggling(false)
    router.refresh()
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Book Cover */}
        <div className="w-24 h-32 relative flex-shrink-0 bg-muted rounded-md overflow-hidden">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Badge variant="secondary" className="mb-1 text-xs">
                {GENRE_LABELS[book.genre]}
              </Badge>
              <h3 className="font-semibold text-foreground line-clamp-1">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {book.author}
              </p>
            </div>
            <Badge 
              variant={book.is_available ? 'default' : 'secondary'}
              className="flex-shrink-0"
            >
              {book.is_available ? '교환 가능' : '교환 불가'}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleAvailability}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : book.is_available ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  비공개
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  공개
                </>
              )}
            </Button>

            {book.file_url && (
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/api/books/${book.id}/download`} target="_blank">
                  <Download className="h-4 w-4 mr-1" />
                  다운로드
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/my-books/${book.id}/edit`}>
                <Pencil className="h-4 w-4 mr-1" />
                수정
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>책을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 작업은 되돌릴 수 없습니다. 책과 관련된 모든 데이터가 영구적으로 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        삭제 중...
                      </>
                    ) : (
                      '삭제'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </Card>
  )
}
