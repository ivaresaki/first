import type { Metadata } from 'next'
import LoginForm from '@/components/login/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
}

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <LoginForm />
    </main>
  )
}
