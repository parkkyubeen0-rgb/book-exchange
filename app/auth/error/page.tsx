import Link from 'next/link'
import { BookOpen, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <BookOpen className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-foreground">BookSwap</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">인증 오류</CardTitle>
            <CardDescription className="text-base">
              인증 과정에서 문제가 발생했습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-center text-muted-foreground">
              이메일 인증 링크가 만료되었거나 이미 사용되었을 수 있습니다.
              다시 시도해주세요.
            </p>

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/auth/sign-up">
                  다시 회원가입하기
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  로그인 페이지로 돌아가기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
