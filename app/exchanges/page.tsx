import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { ExchangeTabs } from '@/components/exchange-tabs'
import { ExchangeRequest, Book, Profile } from '@/lib/types'

interface ExchangesPageProps {
  searchParams: Promise<{
    tab?: 'received' | 'sent'
  }>
}

export default async function ExchangesPage({ searchParams }: ExchangesPageProps) {
  const params = await searchParams
  const tab = params.tab || 'received'
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/exchanges')
  }

  // Fetch received requests (where I'm the owner)
  const { data: receivedRequests } = await supabase
    .from('exchange_requests')
    .select(`
      *,
      requested_book:requested_book_id (
        id,
        title,
        author,
        genre,
        cover_url
      ),
      offered_book:offered_book_id (
        id,
        title,
        author,
        genre,
        cover_url
      ),
      requester:requester_id (
        id,
        nickname
      )
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch sent requests (where I'm the requester)
  const { data: sentRequests } = await supabase
    .from('exchange_requests')
    .select(`
      *,
      requested_book:requested_book_id (
        id,
        title,
        author,
        genre,
        cover_url
      ),
      offered_book:offered_book_id (
        id,
        title,
        author,
        genre,
        cover_url
      ),
      owner:owner_id (
        id,
        nickname
      )
    `)
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  // Transform data to match ExchangeRequest type
  const transformRequests = (requests: any[], type: 'received' | 'sent'): ExchangeRequest[] => {
    return (requests || []).map(req => ({
      ...req,
      requested_book: req.requested_book as Book,
      offered_book: req.offered_book as Book,
      requester: type === 'received' ? req.requester as Profile : undefined,
      owner: type === 'sent' ? req.owner as Profile : undefined,
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">교환 요청</h1>
          <p className="text-muted-foreground mt-1">
            받은 요청과 보낸 요청을 관리하세요
          </p>
        </div>

        <ExchangeTabs
          currentTab={tab}
          receivedRequests={transformRequests(receivedRequests || [], 'received')}
          sentRequests={transformRequests(sentRequests || [], 'sent')}
        />
      </main>
    </div>
  )
}
