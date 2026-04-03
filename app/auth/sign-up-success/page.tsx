import Link from 'next/link'
import { BookOpen, Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignUpSuccessPage() {
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
            <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-xl">이메일을 확인해주세요</CardTitle>
            <CardDescription className="text-base">
              회원가입이 거의 완료되었습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-center text-muted-foreground">
              입력하신 이메일 주소로 확인 메일을 발송했습니다. 
              메일 내 링크를 클릭하여 계정을 활성화해주세요.
            </p>

            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">메일이 오지 않았나요?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>스팸 폴더를 확인해주세요</li>
                <li>이메일 주소가 올바른지 확인해주세요</li>
                <li>몇 분 후에 다시 시도해주세요</li>
              </ul>
            </div>

            <Button asChild variant="outline" className="w-full mt-2">
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                로그인 페이지로 돌아가기
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
