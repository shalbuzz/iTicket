import type React from "react"

interface PageContainerProps {
  children: React.ReactNode
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="space-y-6">{children}</div>
    </div>
  )
}
