'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Book, BookGenre, GENRE_LABELS } from '@/lib/types'
import { AlertCircle, Loader2, Upload, X, BookOpen } from 'lucide-react'

interface BookFormProps {
  userId: string
  book?: Book
}

export function BookForm({ userId, book }: BookFormProps) {
  const router = useRouter()
  const isEditing = !!book

  const [title, setTitle] = useState(book?.title || '')
  const [author, setAuthor] = useState(book?.author || '')
  const [genre, setGenre] = useState<BookGenre>(book?.genre || 'fiction')
  const [description, setDescription] = useState(book?.description || '')
  const [isAvailable, setIsAvailable] = useState(book?.is_available ?? true)
  
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(book?.cover_url || null)
  const [ebookFile, setEbookFile] = useState<File | null>(null)
  const [ebookFileName, setEbookFileName] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 크기는 5MB 이하여야 합니다.')
        return
      }
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  function handleEbookChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['application/pdf', 'application/epub+zip']
      if (!allowedTypes.includes(file.type)) {
        setError('PDF 또는 EPUB 파일만 업로드 가능합니다.')
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('파일 크기는 50MB 이하여야 합니다.')
        return
      }
      setEbookFile(file)
      setEbookFileName(file.name)
      setError(null)
    }
  }

  function removeCover() {
    setCoverFile(null)
    setCoverPreview(null)
  }

  function removeEbook() {
    setEbookFile(null)
    setEbookFileName(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (!author.trim()) {
      setError('저자를 입력해주세요.')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      let coverUrl = book?.cover_url || null
      let fileUrl = book?.file_url || null

      // Upload cover image if changed
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop()
        const coverPath = `${userId}/${Date.now()}-cover.${coverExt}`

        const { error: uploadError } = await supabase.storage
          .from('book-covers')
          .upload(coverPath, coverFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('book-covers')
          .getPublicUrl(coverPath)

        coverUrl = publicUrl
      } else if (!coverPreview && book?.cover_url) {
        // Cover was removed
        coverUrl = null
      }

      // Upload ebook file if changed
      if (ebookFile) {
        const fileExt = ebookFile.name.split('.').pop()
        const filePath = `${userId}/${Date.now()}-ebook.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('ebook-files')
          .upload(filePath, ebookFile)

        if (uploadError) throw uploadError

        // Get signed URL (private bucket)
        fileUrl = filePath // Store path, not URL
      }

      const bookData = {
        user_id: userId,
        title: title.trim(),
        author: author.trim(),
        genre,
        description: description.trim() || null,
        cover_url: coverUrl,
        file_url: fileUrl,
        is_available: isAvailable,
      }

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', book.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('books')
          .insert(bookData)

        if (insertError) throw insertError
      }

      router.push('/my-books')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('저장 중 오류가 발생했습니다. 다시 시도해주세요.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Cover Image */}
      <div className="flex flex-col gap-2">
        <Label>표지 이미지</Label>
        <div className="flex items-start gap-4">
          <Card className="w-32 h-44 overflow-hidden flex-shrink-0">
            {coverPreview ? (
              <div className="relative w-full h-full">
                <Image
                  src={coverPreview}
                  alt="표지 미리보기"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </Card>
          <div className="flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
              id="cover-upload"
            />
            <Label
              htmlFor="cover-upload"
              className="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
            >
              <Upload className="h-4 w-4" />
              이미지 선택
            </Label>
            <p className="text-xs text-muted-foreground mt-2">
              권장: 300x400px, 최대 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">제목 *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="책 제목을 입력하세요"
          required
        />
      </div>

      {/* Author */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="author">저자 *</Label>
        <Input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="저자 이름을 입력하세요"
          required
        />
      </div>

      {/* Genre */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="genre">장르</Label>
        <Select value={genre} onValueChange={(v) => setGenre(v as BookGenre)}>
          <SelectTrigger>
            <SelectValue placeholder="장르 선택" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GENRE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">책 소개</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="책에 대한 간단한 소개를 입력하세요"
          rows={4}
        />
      </div>

      {/* Ebook File */}
      <div className="flex flex-col gap-2">
        <Label>전자책 파일</Label>
        <Card>
          <CardContent className="p-4">
            {ebookFileName || book?.file_url ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {ebookFileName || '파일 업로드됨'}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeEbook}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Input
                  type="file"
                  accept=".pdf,.epub"
                  onChange={handleEbookChange}
                  className="hidden"
                  id="ebook-upload"
                />
                <Label
                  htmlFor="ebook-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
                >
                  <Upload className="h-4 w-4" />
                  파일 선택
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF 또는 EPUB, 최대 50MB
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Is Available */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Label htmlFor="is-available">교환 가능</Label>
          <p className="text-sm text-muted-foreground">
            다른 사용자가 이 책에 교환을 요청할 수 있습니다
          </p>
        </div>
        <Switch
          id="is-available"
          checked={isAvailable}
          onCheckedChange={setIsAvailable}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          취소
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            isEditing ? '수정 완료' : '책 등록'
          )}
        </Button>
      </div>
    </form>
  )
}
