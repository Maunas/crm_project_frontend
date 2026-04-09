import { Box, Grid, IconButton, Link, Rating, Stack, Typography } from '@mui/material'
import { useState } from 'react'
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

export const DateValue = ({ date, isDatetime = false, short = false }:
    { date: string, isDatetime?: boolean, short?: boolean }) => {
    const dayOfWeek = !short ? "dddd " : ""
    const time = isDatetime ? " HH:mm" : ""
    const dateFormat = `${dayOfWeek}DD/MM/YYYY${time}`
    return (
        <Box textTransform="capitalize">
            {dayjs(date).format(dateFormat)}
        </Box>
    )
}


export const PasswordValue = ({ value, allowShow = false }: { value: string, allowShow?: boolean }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    return (
        <Grid container spacing={2} alignItems="center">
            {showPassword ? value : "●●●●●●●●"}
            {allowShow &&
                <IconButton color="primary" size="small" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ?
                        <VisibilityOffIcon /> : <VisibilityIcon />
                    }
                </IconButton>}
        </Grid>
    )
}
export const CardValue = ({ value }: { value: string }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    return (
        <Grid container spacing={2} alignItems="center">
            {showPassword
                ? `${value.substring(0, 4)}-${value.substring(4, 8)}-${value.substring(8, 12)}-${value.slice(-4)}`
                : `●●●●-●●●●-●●●●-${value?.slice(-4)}`}
            <IconButton color="primary" size="small" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ?
                    <VisibilityOffIcon /> : <VisibilityIcon />
                }
            </IconButton>
        </Grid>
    )
}

interface RatingProps {
    value: string,
    subtype: string,
    counter?: boolean,
    size?: "small" | "medium"
}

export const RatingValue = ({ value, subtype, counter = false, size = "medium" }: RatingProps) => {
    const normaliseNPS = (value: number) => ((value - 1) * 100) / (10 - 1);

    return (
        <ChipTooltip counter={counter} size={size} value={value} >
            <Stack direction="row" alignItems="center" spacing={1} lineHeight={0}>
                {subtype === "STAR_RATING" &&
                    <Rating value={Number(value)} size={size} name="read-only" readOnly />
                }
                {subtype === "NPS" &&
                    <CustomBar value={normaliseNPS(Number(value))} variant="determinate" />
                }
                {subtype === "SCORE" &&
                    <CustomBar value={Number(value)} variant="determinate" />
                }
                {size !== "small" && counter &&
                    <CustomChip label={value} color="secondary" />
                }
            </Stack >
        </ChipTooltip>
    )
}

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
            <Grid container justifyContent="end">
                <CommonButton actionType='CLOSE' variant="outlined" onClick={() => modalProps!.handleClose()}>
                    Cerrar Modal
                </CommonButton>
            </Grid>
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

export const BoolValue = ({ value, size = "medium" }: { value: string, size?: "medium" | "small" }) => {
    const boolValue = getFieldType("BOOL", value)
    return (
        <CustomChip color={boolValue ? "success" : "error"} size={size}
            label={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    {boolValue ?
                        <><CheckIcon fontSize={size} /> Si </>
                        : <><CloseIcon fontSize={size} /> No</>}
                </Stack>
            } sx={{ fontWeight: "bold" }} />
    )
}

interface ListValuesProps {
    idFieldValue: number,
    value: Lead[] | NomenclatorItem[] | string;
    type: "Lead" | "Selector";
    maxItems?: number | false;
    isNav?: boolean;
}
export const ListValues = ({ value, idFieldValue, type, isNav = false, maxItems = false }: ListValuesProps) => {

    if (!value || typeof value === "string") return null

    const getLabel = (val: Lead | NomenclatorItem) => {
        if (type === "Lead") return `${(val as Lead).field_values[0].value}`
        else return `${(val as NomenclatorItem).value}`
    }
    const getLink = (val: Lead | NomenclatorItem) => {
        if (type === "Lead") return `/leads/${val.id}`
        else return `/nomenclators/${(val as NomenclatorItem).nomenclator_id}?selected=${val.id}`
    }

    return (
        <Stack direction="row" gap={.5} flexWrap="wrap">
            <>
                {value
                    .slice(0, (typeof maxItems === "number" ? maxItems : undefined))
                    .map(val =>
                        <CustomChip
                            onClick={e => e.stopPropagation()}
                            key={`${idFieldValue}-${val.id}`}
                            label={getLabel(val)}
                            color="secondary" size="sm" sx={{ fontWeight: "bold" }}
                            {...(isNav && { component: RouterLink, to: getLink(val) })}
                        />
                    )}
                {maxItems && value.length > maxItems &&
                    <CustomChip color="secondary" size="sm"
                        onClick={e => e.stopPropagation()}
                        label={`${value.length - maxItems} más`}
                        sx={{ fontWeight: "bold" }} />
                }
            </>

        </Stack>
    )
}
