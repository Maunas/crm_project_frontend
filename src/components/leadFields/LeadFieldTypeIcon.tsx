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
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import React, { useMemo } from 'react';
import { Avatar } from '@mui/material';
import { CustomListItemAvatar } from '../common/lists/CustomListItem';
import type { ColorTypes } from '../../types/mui-theme.d';

export const LeadFieldTypeIcon = ({ typeCode, subtypeCode }: { typeCode?: string | null, subtypeCode?: string | null }) => {

    const icon = useMemo<{ color: ColorTypes, component: React.ReactNode }>(() => {
        switch (typeCode) {
            case "STRING": return { color: "primary", component: <TitleOutlinedIcon /> }
            case "NUMBER": case "INT": return { color: "primary", component: <NumbersOutlinedIcon /> }
            case "BOOL": return { color: "primary", component: <ToggleOnOutlinedIcon /> }

            case "RICH_TEXT": return { color: "secondary", component: <CodeOutlinedIcon /> }
            case "FILE": {
                if (subtypeCode === "FILE_IMAGE") return { color: "secondary", component: <ImageOutlinedIcon /> }
                return { color: "secondary", component: <DescriptionOutlinedIcon /> }
            }
            case "URL": case "INSTAGRAM_USER": {
                if (subtypeCode === "WEBSITE") return { color: "secondary", component: <LinkOutlinedIcon /> }
                else return { color: "secondary", component: <AlternateEmailOutlinedIcon /> }
            }

            case "EMAIL": return { color: "info", component: <EmailOutlinedIcon /> }
            case "PHONE": {
                if (subtypeCode === "MOBILE") return { color: "info", component: <PhoneAndroidOutlinedIcon /> }
                return { color: "info", component: <PhoneOutlinedIcon /> }
            }
            case "ADDRESS": case "POSTAL_CODE": {
                if (subtypeCode === "COORDINATES") return { color: "info", component: <ExploreOutlinedIcon /> }
                if (subtypeCode === "SIMPLE_ADRESS") return { color: "info", component: <MapOutlinedIcon /> }
                return { color: "info", component: <PlaceOutlinedIcon /> }
            }

            case "MONEY": return { color: "success", component: <AttachMoneyOutlinedIcon /> }
            case "CALCULATED": return { color: "success", component: <CalculateOutlinedIcon /> }
            case "DATE_TIME": return { color: "success", component: <AccessTimeOutlinedIcon /> }
            case "DATE": return { color: "success", component: <CalendarTodayOutlinedIcon /> }

            case "RATING": return { color: "warning", component: <StarBorderOutlinedIcon /> }
            case "LEAD": case "USER": return { color: "warning", component: <PersonOutlinedIcon /> }
            case "CHECKBOX": {
                if (subtypeCode === "CHECKBOX_MULTIPLE") return { color: "warning", component: <LibraryAddCheckOutlinedIcon /> }
                return { color: "warning", component: <CheckBoxOutlinedIcon /> }
            }
            case "SELECTOR": {
                if (subtypeCode === "CHECKBOX_MULTIPLE") return { color: "warning", component: <LocalOfferOutlinedIcon /> }
                return { color: "warning", component: <DiscountOutlinedIcon /> }
            }

            case "CREDIT_CARD_SIMPLE": return { color: "error", component: <CreditCardOutlinedIcon /> }
            case "PASSWORD": return { color: "error", component: <VisibilityOutlinedIcon /> }
            default: return { color: "error", component: <InfoOutlinedIcon /> }
        }
    }, [typeCode, subtypeCode])

    return <CustomListItemAvatar color={icon.color}>
        <Avatar variant="rounded" sx={{ height: "2rem", width: "2rem", mx: "auto" }}>
            {icon.component}
        </Avatar>
    </CustomListItemAvatar>
}