import { useEffect } from "react"
import { matchPath, useLocation } from "react-router-dom"
import { ROUTE_LIST_FULL } from "src/routing/routeListExports"
import { CRM_TITLE } from "src/utils/constants"

function resolveTitle(pathname: string) {
  const match = ROUTE_LIST_FULL.find(
    (route) => route.path !== "*" && matchPath(route.path, pathname)
  )
  return match?.title
}

export function usePageTitle(override?: string | null) {
  const { pathname } = useLocation()

  useEffect(() => {
    const title = override ?? resolveTitle(pathname) ?? "CRM"
    document.title = `${title} | ${CRM_TITLE}`
  }, [pathname, override])
}