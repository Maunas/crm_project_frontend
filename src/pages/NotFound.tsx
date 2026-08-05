import { usePageTitle } from "src/hooks/usePageTitle"

export const NotFound = () => {
  usePageTitle("Página no Encontrada")
  return (
    <div>NotFound</div>
  )
}
