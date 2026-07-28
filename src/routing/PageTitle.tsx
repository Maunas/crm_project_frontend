import type { ReactNode } from "react"
import { usePageTitle } from "src/hooks/usePageTitle"

export function PageTitle({ title, children }: { title?: string; children: ReactNode }) {
    usePageTitle(title)
    return <>{children}</>
}
