import type { Theme } from '@mui/material'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { colorTypesArray, type ColorTypes } from 'src/types/mui-theme.d'
import type { DateFormat } from 'src/types/shared'
dayjs.locale('es')

/**
 * Formatea el dinero a ARS, o a otro definido por languageCode y currencyCode
 * @param money
 * @param languageCode Según BCP 47
 * @param currencyCode Según ISO 4217 
 */
export const formatMoney = (money: number, languageCode: string = "es-AR", currencyCode: string = "ARS") => {
    return new Intl.NumberFormat(languageCode, { style: "currency", currency: currencyCode }).format(money)
}

export const formatDate = (date: string, formatType: DateFormat, customFormat: string = 'dddd DD/MM/YYYY HH:mm:ss') => {
    let format
    switch (formatType) {
        case "dateTime": format = "DD/MM/YYYY HH:mm:ss"
            break;
        case "dateTimeLong": format = "dddd DD/MM/YYYY HH:mm:ss"
            break;
        case "date": format = "DD/MM/YYYY"
            break;
        case "dateLong": format = "dddd DD/MM/YYYY"
            break;
        case "time": format = "HH:mm:ss"
            break;
        default: format = customFormat
            break;
    }
    const formattedDate = dayjs(date).format(format)
    return formattedDate === "Invalid Date" ? undefined : formattedDate
}


type FieldType = "NUMBER" | "BOOL" | "OBJECT" | "ARRAY"

/**
 * Recupera el valor numérico, boolean, etc, desde un string.
 * @param fieldType Tipo del dato al que se quiere convertir.
 * @param value Valor original de tipo string. Si no es string se devuelve sin cambios
 */
export const getFieldTypeValue = (fieldType: FieldType, value: unknown) => {
    //Si el valor no es un string lo devuelve
    if (typeof value !== "string") return value;

    switch (fieldType) {
        case "NUMBER":
            return parseInt(value);
        case "BOOL":
            return value === "1" || value === "true";
        case "OBJECT": case "ARRAY":
            return JSON.parse(value)
    }
};

export const isValidURL = (url: string) => {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

export const sanitizePhone = (phone: string) => phone.replace(/\D/g, "")

export const isHex = (color: string) => {
    const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
    return hexRegex.test(color)
}

export const isColorType = (color: string): color is ColorTypes => {
    return colorTypesArray.includes(color)
}

export const getColorPalette = (color: string, theme: Theme) => {
    const isColorHex = isHex(color)
    if (isColorHex) return {
        LIGHTER: theme.lighten(color, .6),
        LIGHT: theme.lighten(color, .3),
        MAIN: color,
        DARK: theme.darken(color, .3),
        DARKER: theme.darken(color, .6)
    }

    const themeColor = isColorType(color) ? color : "primary"

    return {
        LIGHTER: theme.palette[themeColor].lighter,
        LIGHT: theme.palette[themeColor].light,
        MAIN: theme.palette[themeColor].main,
        DARK: theme.palette[themeColor].dark,
        DARKER: theme.palette[themeColor].darker
    }
}