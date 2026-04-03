'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookGenre, GENRE_LABELS } from '@/lib/types'
import { Search, X } from 'lucide-react'

interface BrowseFiltersProps {
  currentSearch?: string
  currentGenre?: BookGenre
}

export function BrowseFilters({ currentSearch, currentGenre }: BrowseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch || '')

  function updateFilters(updates: { search?: string; genre?: string }) {
    const params = new URLSearchParams(searchParams.toString())
    
    if (updates.search !== undefined) {
      if (updates.search) {
        params.set('search', updates.search)
      } else {
        params.delete('search')
      }
    }
    
    if (updates.genre !== undefined) {
      if (updates.genre && updates.genre !== 'all') {
        params.set('genre', updates.genre)
      } else {
        params.delete('genre')
      }
    }

    startTransition(() => {
      router.push(`/browse?${params.toString()}`)
    })
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateFilters({ search })
  }

  function handleClearFilters() {
    setSearch('')
    startTransition(() => {
      router.push('/browse')
    })
  }

  const hasFilters = currentSearch || currentGenre

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="제목 또는 저자로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          검색
        </Button>
      </form>

      <div className="flex gap-2">
        <Select
          value={currentGenre || 'all'}
          onValueChange={(value) => updateFilters({ genre: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="장르 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 장르</SelectItem>
            {Object.entries(GENRE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleClearFilters}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">필터 초기화</span>
          </Button>
        )}
      </div>
    </div>
  )
}
