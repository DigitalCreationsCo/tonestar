"use client"
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./ui/button"
import { useRouter  } from "next/navigation"

export function GoToApp(props: ButtonProps) {
  const router = useRouter();
  return (
    <Button
      {...props}
      className={cn("load-app-btn", props.className)}
      onClick={() => router.push("/app")}
    >
      {"Go to app"}
    </Button>
  )
}