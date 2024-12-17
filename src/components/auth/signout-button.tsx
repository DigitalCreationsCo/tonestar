'use client'
import { useTransition } from 'react'
import { Button } from "../ui/button"
import { handleSignOut } from './actions'

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      className="w-full p-0"
      {...props}
      disabled={isPending}
      onClick={() => startTransition(() => handleSignOut())}
    >
      {isPending ? 'Signing out...' : 'Sign Out'}
    </Button>
  )
}