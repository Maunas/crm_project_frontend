import { memo, useCallback, useMemo, useState } from 'react'
import { ChipTooltip } from 'shared/ui/details/ChipTooltip';
import CustomBar from 'shared/ui/details/CustomProgressBar';
import GenericModal from 'shared/layout/container/GenericModal';
import CommonButton from 'shared/ui/buttons/CommonButton';
import CustomChip from 'shared/ui/details/CustomChip';
import type { Lead } from 'src/types/leads';
import type { DateFormat } from 'src/types/shared';
import type { NomenclatorItem } from 'src/types/nomenclators';
import { getLeadTitleArray } from '../leadUtils';
import { formatDate, getFieldTypeValue } from 'src/utils/formatters';
import DOMPurify from 'dompurify';
import Markdown from 'react-markdown';
import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Link, Rating, Stack, Typography } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export const NewTabLink = ({ url, value }: { url: string, value?: string | null }) => {
    if (!url) return null
    return <Link href={url} sx={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
        title={url} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}>
        {`${value ? value : url}`}
    </Link>
}

export const AddressValue = ({ value, subtype }: { value: string | null, subtype?: string | null }) => {
    if (!value) return null
    if (subtype === "MAPS_URL") return <NewTabLink url={`${value}`} />
    else return <NewTabLink value={value}
        url={`https://www.google.com/maps/search/${value?.replaceAll(" ", "+")}`} />
}

const CAPITALIZE_STYLE = { textTransform: "capitalize" }

export const DateValue = ({ date, isDatetime = false, short = false }:
    { date: string, isDatetime?: boolean, short?: boolean }) => {
    let formatType: DateFormat
    if (isDatetime) {
        formatType = short ? "dateTime" : "dateTimeLong"
    } else {
        formatType = short ? "date" : "dateLong"
    }
    return (
        <div style={CAPITALIZE_STYLE}>
            {formatDate(date, formatType)}
        </div>
    )
}

export const HiddenValue = ({ value, hiddenValue = "●●●●●●●●", allowShow = false }: { value: string, hiddenValue?: string, allowShow?: boolean }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    return (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <div style={CAPITALIZE_STYLE}>{showPassword ? value : hiddenValue}</div>
            {allowShow &&
                <IconButton color="primary" size="small" onClick={() => setShowPassword(prev => !prev)}>
                    {showPassword ?
                        <VisibilityOffIcon /> : <VisibilityIcon />
                    }
                </IconButton>}
        </Stack>
    )
}
export const PasswordValue = ({ value, allowShow = false }: { value: string, allowShow?: boolean }) => {
    return <HiddenValue value={value} allowShow={allowShow} />
}

export const CardValue = ({ value, allowShow = false }: { value: string, allowShow?: boolean }) => {
    return <HiddenValue
        value={`${value.substring(0, 4)}-${value.substring(4, 8)}-${value.substring(8, 12)}-${value.slice(-4)}`}
        hiddenValue={`●●●●-●●●●-●●●●-${value?.slice(-4)}`} allowShow={allowShow} />
}

interface RatingProps {
    value: string,
    subtype?: string | null,
    counter?: boolean,
    tooltip?: boolean,
    size?: "small" | "medium"
}

export const RatingValue = memo(({ value, subtype, counter = false, tooltip = false, size = "medium" }: RatingProps) => {
    const normaliseNPS = (value: number) => ((value - 1) * 100) / (10 - 1);

    return (
        <ChipTooltip show={tooltip} title={value} >
            <Stack direction="row" spacing={1} sx={{ lineHeight: 0, alignItems: "center", width: "auto" }}>
                {subtype === "STAR_RATING" &&
                    <Rating value={Number(value)} size={size} name="read-only" readOnly />
                }
                {subtype === "NPS" &&
                    <CustomBar value={normaliseNPS(Number(value))} variant="determinate" />
                }
                {subtype === "SCORE" &&
                    <CustomBar value={Number(value)} variant="determinate" />
                }
                {counter &&
                    <CustomChip label={value} color="secondary" />
                }
            </Stack >
        </ChipTooltip>
    )
})

interface ModalProps {
    modalProps?: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
        handleClose: () => void;
    }
    idModal: string,
    type: string,
    subtype?: string | null,
    value: string,
    size?: "small" | "medium"
}

export const ModalValue = ({ modalProps, idModal, type, subtype, value, size = "medium" }: ModalProps) => {
    const getBtnText = () => {
        switch (type) {
            case "RICH_TEXT": return subtype === "HTML" ? "Ver HTML" : "Ver Markdown"
            case "FILE": return subtype === "FILE_IMAGE" ? "Ver Imagen" : "Ver Documento"
            default: return "Ver Contenido"
        }
    }
    return (
        <GenericModal idModal={idModal} modalProps={modalProps!} btnProps={{ size: size, actionType: 'DETAILS' }}
            buttonText={getBtnText()} sx={{ minWidth: "80vw" }} >
            <ModalValueContent type={type} subtype={subtype} value={value} />
            <CommonButton actionType='CLOSE' variant="outlined" sx={{ marginLeft: "auto" }} onClick={() => modalProps!.handleClose()}>
                Cerrar Modal
            </CommonButton>
        </GenericModal>
    )
}
interface ModalContentProps {
    type: string;
    subtype?: string | null;
    value: string;
}
const ModalValueContent = ({ type, subtype, value }: ModalContentProps) => {

    if (type === "RICH_TEXT" && subtype === "HTML") {
        const purifiedHTML = DOMPurify.sanitize(value)
        return purifiedHTML
            ? <div style={{ paddingLeft: ".5rem" }} dangerouslySetInnerHTML={{ __html: purifiedHTML }} />
            : <Typography variant="body1" color="error">Contenido HTML no seguro, no se puede mostrar.</Typography>
    }
    if (type === "RICH_TEXT" && subtype === "MARKDOWN") {
        return <Markdown >{value}</Markdown>
    }
    if (type === "FILE" && subtype === "FILE_IMAGE") {
        return <img src={value} alt={"Imagen adjunta."} />
    }
    if (type === "FILE" && subtype === "FILE_DOCUMENT") {
        return <Box component="iframe" src={value}
            width="100%" height="600px" sx={{ border: "none" }}
        />
    }
    return <Box>Tipo de contenido no soportado: {type}/{subtype}</Box>
}

export const BoolValue = memo(({ value, size = "medium" }: { value: string, size?: "medium" | "small" }) => {
    const boolValue = useMemo(() => getFieldTypeValue("BOOL", value), [value])
    return (
        <CustomChip color={boolValue ? "success" : "error"} size={size}
            label={boolValue ?
                <div><CheckIcon fontSize={size} /> Si </div>
                : <div><CloseIcon fontSize={size} /> No</div>
            } sx={{ fontWeight: "bold" }} />
    )
})

interface ListValuesProps {
    idFieldValue: number,
    value: Lead[] | NomenclatorItem[] | string;
    type: "Lead" | "Selector";
    maxItems?: number | false;
    isNav?: boolean;
    renderAs?: "chips" | "text";
    shortTitle?: boolean
}
const STOP_PROPAGATION = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => e.stopPropagation()

export const ListValues = memo(({ value, idFieldValue, type, isNav = false, maxItems = false, shortTitle = false }: ListValuesProps) => {

    const typedValue = useMemo(() => value as Lead[] | NomenclatorItem[]
        , [value])

    const visibleItems = useMemo(() => {
        const limit = typeof maxItems === "number" ? maxItems : undefined
        return typedValue.slice(0, limit)
    }, [typedValue, maxItems])

    const getLabel = useCallback((val: Lead | NomenclatorItem) => {
        if (type === "Lead") return getLeadTitleArray(val as Lead, shortTitle).join(" ")
        else return `${(val as NomenclatorItem).value}`
    }, [type, shortTitle])

    const getLink = useCallback((val: Lead | NomenclatorItem) => {
        if (type === "Lead") return `/leads/${val.id}`
        else return `/nomenclators/${(val as NomenclatorItem).nomenclator_id}?selected=${val.id}`
    }, [type])

    const overflowCount = useMemo(() => {
        if (!maxItems) return 0
        return typedValue.length > maxItems ? typedValue.length - maxItems : 0
    }, [typedValue.length, maxItems])

    if (!typedValue || typeof typedValue === "string") return null

    return (
        <Stack direction="row" spacing={.5} useFlexGap sx={{ flexWrap: "wrap" }}>
            {visibleItems.map(val =>
                <CustomChip
                    key={`${idFieldValue}-${val.id}`}
                    label={getLabel(val)} title={getLabel(val)}
                    color="secondary" size="small"
                    {...(isNav && {
                        component: RouterLink, to: getLink(val),
                        onClick: STOP_PROPAGATION
                    })}
                />
            )}
            {overflowCount > 0 &&
                <CustomChip color="secondary" size="small"
                    label={`${overflowCount} más`} />
            }
        </Stack>
    )
})
