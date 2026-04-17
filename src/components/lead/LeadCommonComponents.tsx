import { Box, IconButton, Link, Rating, Stack, Typography } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { CustomBar, CustomChip } from '../common/details/StyledDisplayComponents'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import dayjs from 'dayjs';
import { ChipTooltip } from '../common/details/ChipTooltip';
import { GenericModal } from '../common/layout/GenericContainer';
import DOMPurify from 'dompurify';
import Markdown from 'react-markdown';
import { CommonButton } from '../common/details/DetailsCommonButton';
import { getFieldType } from '../../generalService';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { NomenclatorItem } from '../../types/nomenclators';
import type { Lead } from '../../types/leads';
import { Link as RouterLink } from 'react-router-dom';

export const NewTabLink = ({ url, value }: { url: string, value?: string }) =>
    <Link href={`${url}`} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}>
        {`${value ? value : url}`}
    </Link>


export const AddressValue = ({ value, subtype }: { value: string, subtype: string }) => {
    if (subtype === "MAPS_URL") return <NewTabLink url={`${value}`} />
    else return <NewTabLink value={value}
        url={`https://www.google.com/maps/search/${value.replaceAll(" ", "+")}`} />
}

const CAPITALIZE_STYLE = { textTransform: "capitalize" }

export const DateValue = ({ date, isDatetime = false, short = false }:
    { date: string, isDatetime?: boolean, short?: boolean }) => {
    const dayOfWeek = !short ? "dddd " : ""
    const time = isDatetime ? " HH:mm" : ""
    const dateFormat = `${dayOfWeek}DD/MM/YYYY${time}`
    return (
        <div style={CAPITALIZE_STYLE}>
            {dayjs(date).format(dateFormat)}
        </div>
    )
}


export const HiddenValue = ({ value, hiddenValue = "●●●●●●●●", allowShow = false }: { value: string, hiddenValue?: string, allowShow?: boolean }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    return (
        <Stack direction="row" gap={2} alignItems="center">
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
    subtype: string,
    counter?: boolean,
    tooltip?: boolean,
    size?: "small" | "medium"
}

export const RatingValue = memo(({ value, subtype, counter = false, tooltip = false, size = "medium" }: RatingProps) => {
    const normaliseNPS = (value: number) => ((value - 1) * 100) / (10 - 1);

    return (
        <ChipTooltip counter={tooltip} value={value} >
            <Stack direction="row" alignItems="center" spacing={1} lineHeight={0} width="min-content">
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
    subtype?: string,
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
        <GenericModal idModal={idModal} modalProps={modalProps!} size={size} actionType='DETAILS'
            buttonText={getBtnText()} containerSx={{ minWidth: "80vw" }} >
            <ModalValueContent type={type} subtype={subtype} value={value} />
            <CommonButton actionType='CLOSE' variant="outlined" sx={{ marginLeft: "auto" }} onClick={() => modalProps!.handleClose()}>
                Cerrar Modal
            </CommonButton>
        </GenericModal>
    )
}
interface ModalContentProps {
    type: string;
    subtype?: string;
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
    const boolValue = useMemo(() => getFieldType("BOOL", value), [value])
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
}
const STOP_PROPAGATION = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => e.stopPropagation()

export const ListValues = memo(({ value, idFieldValue, type, isNav = false, maxItems = false }: ListValuesProps) => {

    const typedValue = useMemo(() => value as Lead[] | NomenclatorItem[]
        , [value])

    const visibleItems = useMemo(() => {
        const limit = typeof maxItems === "number" ? maxItems : undefined
        return typedValue.slice(0, limit)
    }, [typedValue, maxItems])

    const getLabel = useCallback((val: Lead | NomenclatorItem) => {
        if (type === "Lead") return `${(val as Lead).field_values[0].value}`
        else return `${(val as NomenclatorItem).value}`
    }, [type])

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
        <Stack direction="row" gap={.5} flexWrap="wrap">
            {visibleItems.map(val =>
                <CustomChip
                    key={`${idFieldValue}-${val.id}`}
                    label={getLabel(val)}
                    color="secondary" size="sm"
                    {...(isNav && {
                        component: RouterLink, to: getLink(val),
                        onClick: STOP_PROPAGATION
                    })}
                />
            )}
            {overflowCount > 0 &&
                <CustomChip color="secondary" size="sm"
                    label={`${overflowCount} más`} />
            }
        </Stack>
    )
})
