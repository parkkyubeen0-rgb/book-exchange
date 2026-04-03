import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Book, GENRE_LABELS } from '@/lib/types'
import { BookOpen, User } from 'lucide-react'

interface BookCardProps {
  book: Book
  showOwner?: boolean
  linkToDetail?: boolean
}

export function BookCard({ book, showOwner = true, linkToDetail = true }: BookCardProps) {
  const content = (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-[3/4] relative bg-muted overflow-hidden">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {!book.is_available && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">교환 불가</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-2 text-xs">
          {GENRE_LABELS[book.genre]}
        </Badge>
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
          {book.author}
        </p>
        {showOwner && book.profiles && (
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{book.profiles.nickname}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (linkToDetail) {
    return (
      <Link href={`/books/${book.id}`} className="block">
        {content}
      </Link>
    )
  }

  return content
}
