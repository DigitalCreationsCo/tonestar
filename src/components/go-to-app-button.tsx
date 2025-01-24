"use client"
import { Button, ButtonProps } from "./ui/button"
import { useRouter  } from "next/navigation"

export function GoToApp(props: ButtonProps) {
  const router = useRouter();
  return (
    <Button
      {...props}
      className="load-app-btn"
      onClick={() => router.push("/app")}
    >
      {"Go to app"}
    </Button>
  )
}