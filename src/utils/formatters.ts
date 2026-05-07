
/**
 * Formatea el dinero a ARS, o a otro definido por languageCode y currencyCode
 * @param money
 * @param languageCode Según BCP 47
 * @param currencyCode Según ISO 4217 
 */
export const formatMoney = (money: number, languageCode: string = "es-AR", currencyCode: string = "ARS") => {
    return new Intl.NumberFormat(languageCode, { style: "currency", currency: currencyCode }).format(money)
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
