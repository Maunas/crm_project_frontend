import { useMemo, type ReactNode } from 'react';
import { CustomListItemAvatar } from '../../components/ui/lists/CustomListItem';
import type { ColorTypes } from '../../types/mui-theme.d';
import { Avatar } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LibraryAddCheckOutlinedIcon from '@mui/icons-material/LibraryAddCheckOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import DiscountOutlinedIcon from '@mui/icons-material/DiscountOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import DriveFileRenameOutlineSharpIcon from '@mui/icons-material/DriveFileRenameOutlineSharp';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';

type TypeIconItem = {
    color: ColorTypes,
    component: ReactNode
}

const TYPE_ICONS: Record<string, TypeIconItem> = {
    //primary - Tipos de dato primitivos
    STRING: { color: "primary", component: <DriveFileRenameOutlineSharpIcon /> },
    NUMBER: { color: "primary", component: <NumbersOutlinedIcon /> },
    BOOL: { color: "primary", component: <ToggleOnOutlinedIcon /> },

    //info - Datos de Contacto
    EMAIL: { color: "info", component: <EmailOutlinedIcon /> },
    PHONE: { color: "info", component: <PhoneOutlinedIcon /> },
    MOBILE: { color: "info", component: <PhoneAndroidOutlinedIcon /> },
    SIMPLE_ADDRESS: { color: "info", component: <MapOutlinedIcon /> },
    MAPS_URL: { color: "info", component: <PlaceOutlinedIcon /> },
    COORDINATES: { color: "info", component: <ExploreOutlinedIcon /> },

    //secondary - Otros datos
    WEBSITE: { color: "secondary", component: <LinkOutlinedIcon /> },
    SOCIAL_MEDIA: { color: "secondary", component: <AlternateEmailOutlinedIcon /> },
    HTML: { color: "secondary", component: <CodeOutlinedIcon /> },
    FILE_IMAGE: { color: "secondary", component: <ImageOutlinedIcon /> },
    FILE_DOCUMENT: { color: "secondary", component: <DescriptionOutlinedIcon /> },

    //warning - Datos múltiples y rating
    LEAD: { color: "warning", component: <PersonOutlinedIcon /> },
    SELECTOR_MULTIPLE: { color: "warning", component: <DiscountOutlinedIcon /> },
    SELECTOR_SIMPLE: { color: "warning", component: <LocalOfferOutlinedIcon /> },
    CHECKBOX_MULTIPLE: { color: "warning", component: <LibraryAddCheckOutlinedIcon /> },
    CHECKBOX_SIMPLE: { color: "warning", component: <CheckBoxOutlinedIcon /> },
    RATING: { color: "warning", component: <StarBorderOutlinedIcon /> },

    //success - Datos numéricos especiales, y fechas
    DATE: { color: "success", component: <TodayOutlinedIcon /> },
    TIME_ONLY: { color: "success", component: <AccessTimeOutlinedIcon /> },
    CALCULATED: { color: "success", component: <CalculateOutlinedIcon /> },
    MONEY: { color: "success", component: <AttachMoneyOutlinedIcon /> },
    PERCENTAGE: { color: "success", component: <PercentOutlinedIcon /> },

    //error - Datos sensibles, y no reconocidos
    PASSWORD: { color: "error", component: <VisibilityOutlinedIcon /> },
    CREDIT_CARD: { color: "error", component: <CreditCardOutlinedIcon /> },
    DEFAULT: { color: "error", component: <InfoOutlinedIcon /> },
}

type TypeIcon = keyof typeof TYPE_ICONS

export const LeadFieldTypeIcon = ({ typeCode, subtypeCode }: { typeCode?: string | null, subtypeCode?: string | null }) => {

    const icon = useMemo<TypeIconItem>(() => {
        switch (typeCode) {
            case "LEAD": case "USER": return TYPE_ICONS.LEAD
            case "CALCULATED": return TYPE_ICONS.CALCULATED
            case "FILE": {
                const fileSubtype = (subtypeCode &&
                    ["FILE_IMAGE", "FILE_DOCUMENT"].includes(subtypeCode))
                    ? subtypeCode as TypeIcon : "FILE_DOCUMENT"
                return TYPE_ICONS[fileSubtype]
            }
            case "SELECTOR": {
                const selSubtype = (subtypeCode &&
                    ["SELECTOR_MULTIPLE", "SELECTOR_SIMPLE", "CHECKBOX_MULTIPLE", "CHECKBOX_SIMPLE"].includes(subtypeCode))
                    ? subtypeCode as TypeIcon : "SELECTOR_SIMPLE"
                return TYPE_ICONS[selSubtype]
            }
            case "BOOL": return TYPE_ICONS.BOOL
            case "DATE_TIME": return subtypeCode === "TIME_ONLY" ? TYPE_ICONS.TIME_ONLY : TYPE_ICONS.DATE
            case "DATE": return TYPE_ICONS.DATE
            case "NUMBER": case "INT": {
                const numSubtype = (subtypeCode && ["STAR_RATING", "NPS", "SCORE"].includes(subtypeCode)) ? "RATING"
                    : (subtypeCode ?? "NUMBER") as TypeIcon
                return TYPE_ICONS[numSubtype]
            }

            case "STRING": {
                if (!subtypeCode) return TYPE_ICONS.STRING
                if (["URL", "WEBSITE"].includes(subtypeCode)) return TYPE_ICONS.WEBSITE
                if (["WHATSAPP", "MOBILE"].includes(subtypeCode)) return TYPE_ICONS.MOBILE
                if (["PHONE", "LANDLINE"].includes(subtypeCode)) return TYPE_ICONS.PHONE
                if (["HTML", "MARKDOWN"].includes(subtypeCode)) return TYPE_ICONS.HTML
                return TYPE_ICONS[subtypeCode as TypeIcon]
            }

            //Templates con íconos
            case "POSTAL_CODE": return TYPE_ICONS.SIMPLE_ADDRESS
            case "CREDIT_CARD_SIMPLE": return TYPE_ICONS.CREDIT_CARD
            case "INSTAGRAM_USER": return TYPE_ICONS.SOCIAL_MEDIA

            default: return TYPE_ICONS.DEFAULT
        }
    }, [typeCode, subtypeCode])

    return <CustomListItemAvatar color={icon.color}>
        <Avatar variant="rounded" sx={{ height: "2rem", width: "2rem", mx: "auto" }}>
            {icon.component}
        </Avatar>
    </CustomListItemAvatar>
}