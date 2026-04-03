export type BookGenre = 
  | 'fiction'
  | 'non-fiction'
  | 'mystery'
  | 'sci-fi'
  | 'fantasy'
  | 'romance'
  | 'thriller'
  | 'biography'
  | 'self-help'
  | 'business'
  | 'history'
  | 'science'
  | 'cooking'
  | 'travel'
  | 'other'

export const GENRE_LABELS: Record<BookGenre, string> = {
  'fiction': '소설',
  'non-fiction': '논픽션',
  'mystery': '미스터리',
  'sci-fi': 'SF',
  'fantasy': '판타지',
  'romance': '로맨스',
  'thriller': '스릴러',
  'biography': '전기',
  'self-help': '자기계발',
  'business': '비즈니스',
  'history': '역사',
  'science': '과학',
  'cooking': '요리',
  'travel': '여행',
  'other': '기타',
}

export type ExchangeStatus = 'pending' | 'accepted' | 'rejected' | 'completed'

export const EXCHANGE_STATUS_LABELS: Record<ExchangeStatus, string> = {
  'pending': '대기 중',
  'accepted': '수락됨',
  'rejected': '거절됨',
  'completed': '완료',
}

export interface Profile {
  id: string
  nickname: string
  created_at: string
}

export interface Book {
  id: string
  user_id: string
  title: string
  author: string
  genre: BookGenre
  description: string | null
  cover_url: string | null
  file_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface ExchangeRequest {
  id: string
  requester_id: string
  owner_id: string
  requested_book_id: string
  offered_book_id: string
  status: ExchangeStatus
  message: string | null
  created_at: string
  updated_at: string
  requested_book?: Book
  offered_book?: Book
  requester?: Profile
  owner?: Profile
}
