import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: {
    id: string
  }
}

export async function GET(_: Request, { params }: Params) {
  const { id } = params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect('/auth/login')
  }

  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('user_id, file_url')
    .eq('id', id)
    .single()

  if (bookError || !book || !book.file_url) {
    return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 })
  }

  if (book.user_id !== user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('ebook-files')
    .createSignedUrl(book.file_url, 60)

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return NextResponse.json({ error: '다운로드 링크를 생성할 수 없습니다.' }, { status: 500 })
  }

  return NextResponse.redirect(signedUrlData.signedUrl)
}
