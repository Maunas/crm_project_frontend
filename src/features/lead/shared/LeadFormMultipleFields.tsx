import { useEffect, useMemo, useRef, useState } from "react"
import { LeadFieldInputIcon } from "features/leadFields/LeadFieldTypeIcon"
import { AutocompleteLoader, ControlledAutocomplete, ControlledGroupedCheckbox, ControlledRadio } from "shared/ui/forms/CustomMultipleInputs"
import type { NomenclatorItem } from "src/types/nomenclators"
import type { Lead } from "src/types/leads"
import { getLeadTitleArray } from "../leadUtils"
import { getNomenclatorItems } from "features/nomenclators/nomenclatorService"
import { useWatch, type Control, type FieldValues, type Path, type UseFormSetValue } from "react-hook-form"
import { FormControl, InputLabel, OutlinedInput } from "@mui/material"

interface BasicFormInput<T extends FieldValues> {
    control: Control<T>,
    name: Path<T>,
    label?: string,
    size?: "small" | "medium"
    errorMessage?: string,
    required?: boolean,
    showAdornment?: boolean
}

interface LeadFormLeadProps<T extends FieldValues> extends BasicFormInput<T> {
    options?: Lead[],
    shortTitle?: boolean
}
export const LeadFormRelatedLead = <T extends FieldValues>
    ({ control, name, label, options, required = false, size = "medium", shortTitle = false, errorMessage, showAdornment = false }: LeadFormLeadProps<T>) => {

    const optionTitle = useMemo(() => {
        const labelMap = new Map<number, string>()
        options?.forEach(op => {
            labelMap.set(op.id, getLeadTitleArray(op, shortTitle).join(" "))
        })
        return labelMap
    }, [options, shortTitle])

    if (options && options.length > 0) {
        return (
            <ControlledAutocomplete control={control} name={name} label={label} options={options} returnField="id"
                getOptionLabel={op => optionTitle.get(op?.id) ?? "Nombre no disponible"} getOptionKey={option => `${option?.id}`}
                size={size} required={required} errorMessage={errorMessage} autocomplete="one-time-code" multiple
                startAdornment={showAdornment && <LeadFieldInputIcon typeCode="LEAD" position="start" />}
            />
        )
    }
    return <AutocompleteLoader label={label} size={size} />
}


interface LeadFormSelectorProps<T extends FieldValues> extends BasicFormInput<T> {
    options?: NomenclatorItem[],
    subtype?: string,
    disabled?: boolean,
    helperText?: string,
}
/**
 * Campo para el tipo "SELECTOR", se separa en subtipos "SELECTOR" y "CHECKBOX"
 */
export const LeadFormSelector = <T extends FieldValues>(
    { control, name, label, options, subtype, required = false, size = "medium", errorMessage, showAdornment = false,
        disabled = false, helperText }: LeadFormSelectorProps<T>
) => {

    if (!subtype) return

    if (["SELECTOR_MULTIPLE", "SELECTOR_SIMPLE"].includes(subtype)) {
        return <LeadFormNomenclator control={control} name={name} label={label} options={options}
            size={size} multiple={subtype === "SELECTOR_MULTIPLE"} required={required} errorMessage={errorMessage}
            showAdornment={showAdornment} disabled={disabled} helperText={helperText} />
    }

    if (["CHECKBOX_MULTIPLE", "CHECKBOX_SIMPLE"].includes(subtype)) {
        return <LeadFormCheckbox control={control} name={name} label={label} options={options}
            size={size} multiple={subtype === "CHECKBOX_MULTIPLE"} required={required} errorMessage={errorMessage}
            showAdornment={showAdornment} disabled={disabled} helperText={helperText} />
    }

}

interface DependentLeadFormSelectorProps<T extends FieldValues> extends BasicFormInput<T> {
    parentName: Path<T>,
    setValue: UseFormSetValue<T>,
    subtype?: string,
}
/**
 * Selector/Checkbox cuyas opciones dependen del valor elegido en otro campo (`depends_on_field_id`, ver nomencladores.md §8).
 * Queda bloqueado hasta que el campo padre (identificado por `parentName`, dentro del mismo formulario) tenga un valor;
 * al cambiar el padre, sus opciones se recalculan y el valor ya elegido en este campo se limpia (salvo en el primer
 * render, para no perder el valor persistido al cargar un lead existente).
 */
export const DependentLeadFormSelector = <T extends FieldValues>(
    { control, name, parentName, setValue, label, subtype, required = false, size = "medium", errorMessage, showAdornment = false }: DependentLeadFormSelectorProps<T>
) => {

    const parentValue = useWatch({ control, name: parentName })
    const [options, setOptions] = useState<NomenclatorItem[]>([])
    const prevParentIdsRef = useRef<string | undefined>(undefined)

    //El valor del padre puede ser un único id (SELECTOR_SIMPLE/CHECKBOX_SIMPLE) o un arreglo (los MULTIPLE)
    const parentIds = useMemo(() => {
        if (parentValue === null || parentValue === undefined || parentValue === "") return []
        return Array.isArray(parentValue) ? parentValue : [parentValue]
    }, [parentValue]) as number[]

    //Busca las opciones hijas de cada valor elegido en el padre (semántica OR si el padre permite selección múltiple)
    useEffect(() => {
        if (parentIds.length === 0) {
            setOptions([])
            return
        }
        let cancelled = false
        Promise.all(parentIds.map(id => getNomenclatorItems({ only_active: true, page_size: 0, parent_item_id: id })))
            .then(results => {
                if (cancelled) return
                const merged = new Map<number, NomenclatorItem>()
                results.forEach(res => res.items.forEach(item => merged.set(item.id, item)))
                setOptions(Array.from(merged.values()))
            })
        return () => { cancelled = true }
    }, [parentIds])

    //Limpia el valor de este campo cuando el padre cambia, pero no en el primer render (carga inicial de un valor existente)
    useEffect(() => {
        const serialized = JSON.stringify(parentIds)
        if (prevParentIdsRef.current !== undefined && prevParentIdsRef.current !== serialized) {
            const clearedValue = ["SELECTOR_MULTIPLE", "CHECKBOX_MULTIPLE"].includes(subtype ?? "") ? [] : null
            setValue(name, clearedValue, { shouldDirty: true })
        }
        prevParentIdsRef.current = serialized
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentIds])

    const disabled = parentIds.length === 0

    return (
        <LeadFormSelector control={control} name={name} options={options} label={label} subtype={subtype}
            required={required} errorMessage={errorMessage} size={size} showAdornment={showAdornment} disabled={disabled}
            helperText={disabled ? "Elegí primero el campo del que depende" : undefined} />
    )
}

interface LeadFormNomenclatorProps<T extends FieldValues> extends BasicFormInput<T> {
    label?: string,
    options?: NomenclatorItem[],
    required?: boolean,
    multiple?: boolean,
    disabled?: boolean,
    helperText?: string,
}

export const LeadFormNomenclator = <T extends FieldValues>({ control, name, label, options,
    multiple = false, required = false, size = "medium", errorMessage, showAdornment = false,
    disabled = false, helperText }: LeadFormNomenclatorProps<T>) => {

    if (disabled || (options && options.length > 0)) {
        return (
            <ControlledAutocomplete control={control} name={name} label={label} options={options ?? []} returnField="id"
                getOptionLabel={option => option.value!} getOptionKey={option => `${option.id}`}
                required={required} size={size} multiple={multiple} disabled={disabled} helper={helperText}
                errorMessage={errorMessage} autocomplete="one-time-code"
                startAdornment={showAdornment && <LeadFieldInputIcon typeCode="SELECTOR" subtypeCode={multiple ? "SELECTOR_MULTIPLE" : "SELECTOR_SIMPLE"}
                    position="start" sx={{ pl: .5 }} />}
            />
        )
    }
    else return <AutocompleteLoader label={label} size={size} />
}


interface LeadFormCheckboxProps<T extends FieldValues> extends BasicFormInput<T> {
    label?: string,
    options?: NomenclatorItem[],
    required?: boolean,
    multiple?: boolean,
    disabled?: boolean,
    helperText?: string,
}
export const LeadFormCheckbox = <T extends FieldValues>({ control, name, label, options,
    multiple = false, required = false, size = "medium", errorMessage, showAdornment = false,
    disabled = false, helperText }: LeadFormCheckboxProps<T>) => {

    if (!disabled && (!options || options.length === 0)) return null

    return (
        <FormControl variant="outlined" fullWidth>
            <InputLabel shrink>{label}</InputLabel>

            <OutlinedInput fullWidth notched label={label}
                sx={{ p: size === "medium" ? ".5rem 1rem" : "0 .5rem", cursor: "default" }}
                inputComponent={() => (
                    multiple ?
                        <ControlledGroupedCheckbox control={control} name={name} options={options ?? []}
                            returnField="id" keyField="id" getCheckboxLabel={option => option.value!}
                            required={required} errorMessage={errorMessage} row disabled={disabled} helper={helperText}
                            startAdornment={showAdornment && < LeadFieldInputIcon typeCode="SELECTOR" subtypeCode="CHECKBOX_MULTIPLE" position="start" />} />
                        :
                        <ControlledRadio control={control} name={name} options={options ?? []}
                            returnField="id" keyField="id" isReturnInt getRadioLabel={option => option.value!}
                            required={required} errorMessage={errorMessage} row disabled={disabled} helper={helperText}
                            startAdornment={showAdornment && < LeadFieldInputIcon typeCode="SELECTOR" subtypeCode="CHECKBOX_SIMPLE" position="start" />} />
                )} />

        </FormControl>
    )
}
