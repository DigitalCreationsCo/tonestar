"use client"
import { Button, ButtonProps } from "./ui/button"
import { useRouter  } from "next/navigation"

export function GoToApp(props: ButtonProps) {
  const router = useRouter();
  return (
    <Button
      {...props}
      onClick={() => router.push("/home")}
    >
      {"Go to app"}
    </Button>
  )
}