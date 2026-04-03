import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { BookForm } from '@/components/book-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function NewBookPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/my-books/new')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/my-books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            내 책 목록으로 돌아가기
          </Link>
        </Button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">새 책 등록</h1>
          <p className="text-muted-foreground mb-8">
            교환할 전자책 정보를 입력해주세요
          </p>

          <BookForm userId={user.id} />
        </div>
      </main>
    </div>
  )
}
