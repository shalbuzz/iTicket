import { toast } from "@/hooks/use-toast"

export const ok = (message: string) => {
  toast({
    title: "Success",
    description: message,
  })
}

export const fail = (message: string) => {
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  })
}
