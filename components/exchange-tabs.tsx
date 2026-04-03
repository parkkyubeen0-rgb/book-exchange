'use client'

import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReceivedRequestCard } from '@/components/received-request-card'
import { SentRequestCard } from '@/components/sent-request-card'
import { ExchangeRequest } from '@/lib/types'
import { Inbox, Send, RefreshCw } from 'lucide-react'

interface ExchangeTabsProps {
  currentTab: 'received' | 'sent'
  receivedRequests: ExchangeRequest[]
  sentRequests: ExchangeRequest[]
}

export function ExchangeTabs({ currentTab, receivedRequests, sentRequests }: ExchangeTabsProps) {
  const router = useRouter()

  function handleTabChange(value: string) {
    router.push(`/exchanges?tab=${value}`)
  }

  const pendingReceivedCount = receivedRequests.filter(r => r.status === 'pending').length
  const pendingSentCount = sentRequests.filter(r => r.status === 'pending').length

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="received" className="gap-2">
          <Inbox className="h-4 w-4" />
          받은 요청
          {pendingReceivedCount > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {pendingReceivedCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent" className="gap-2">
          <Send className="h-4 w-4" />
          보낸 요청
          {pendingSentCount > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {pendingSentCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="received" className="mt-6">
        {receivedRequests.length > 0 ? (
          <div className="flex flex-col gap-4">
            {receivedRequests.map((request) => (
              <ReceivedRequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <EmptyState type="received" />
        )}
      </TabsContent>

      <TabsContent value="sent" className="mt-6">
        {sentRequests.length > 0 ? (
          <div className="flex flex-col gap-4">
            {sentRequests.map((request) => (
              <SentRequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <EmptyState type="sent" />
        )}
      </TabsContent>
    </Tabs>
  )
}

function EmptyState({ type }: { type: 'received' | 'sent' }) {
  return (
    <div className="text-center py-16 bg-muted/50 rounded-lg">
      <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-lg font-semibold text-foreground mb-2">
        {type === 'received' ? '받은 요청이 없습니다' : '보낸 요청이 없습니다'}
      </h2>
      <p className="text-muted-foreground">
        {type === 'received' 
          ? '다른 사용자가 교환을 요청하면 여기에 표시됩니다'
          : '책 탐색에서 원하는 책을 찾아 교환을 요청해보세요'}
      </p>
    </div>
  )
}
