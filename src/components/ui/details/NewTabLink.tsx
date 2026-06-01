import { Link } from "@mui/material"
import { isValidURL } from "src/utils/formatters"

const NewTabLink = ({ url, title }: { url: string, title?: string | null }) => {
    if (!isValidURL(url)) return title ?? url
    return <Link href={url} sx={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
        title={url} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}>
        {`${title ? title : url}`}
    </Link>
}

export default NewTabLink