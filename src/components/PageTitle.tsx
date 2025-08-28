import type React from "react"

interface PageTitleProps {
  children: React.ReactNode
}

export const PageTitle: React.FC<PageTitleProps> = ({ children }) => {
  return <h1 className="text-2xl font-semibold mb-4">{children}</h1>
}
