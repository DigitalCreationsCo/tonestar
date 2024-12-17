"use client"
import { useTransition } from 'react'
import { Button } from "../ui/button"
import { handleSignIn } from './actions'

export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      {...props}
      disabled={isPending}
      onClick={() => startTransition(() => handleSignIn(provider))}
    >
      {isPending ? 'Signing in...' : 'Sign In'}
    </Button>
  )
}