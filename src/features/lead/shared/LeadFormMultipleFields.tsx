import { useMemo } from "react"
import { LeadFieldInputIcon } from "features/leadFields/LeadFieldTypeIcon"
import { AutocompleteLoader, ControlledAutocomplete, ControlledGroupedCheckbox, ControlledRadio } from "shared/ui/forms/CustomMultipleInputs"
import type { NomenclatorItem } from "src/types/nomenclators"
import type { Lead } from "src/types/leads"
import { getLeadTitleArray } from "../leadUtils"
import type { Control, FieldValues, Path } from "react-hook-form"
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
}
/**
 * Campo para el tipo "SELECTOR", se separa en subtipos "SELECTOR" y "CHECKBOX"
 */
export const LeadFormSelector = <T extends FieldValues>(
    { control, name, label, options, subtype, required = false, size = "medium", errorMessage, showAdornment = false }: LeadFormSelectorProps<T>
) => {

    if (!subtype) return

    if (["SELECTOR_MULTIPLE", "SELECTOR_SIMPLE"].includes(subtype)) {
        return <LeadFormNomenclator control={control} name={name} label={label} options={options}
            size={size} multiple={subtype === "SELECTOR_MULTIPLE"} required={required} errorMessage={errorMessage}
            showAdornment={showAdornment} />
    }

    if (["CHECKBOX_MULTIPLE", "CHECKBOX_SIMPLE"].includes(subtype)) {
        return <LeadFormCheckbox control={control} name={name} label={label} options={options}
            size={size} multiple={subtype === "CHECKBOX_MULTIPLE"} required={required} errorMessage={errorMessage}
            showAdornment={showAdornment} />
    }

}

interface LeadFormNomenclatorProps<T extends FieldValues> extends BasicFormInput<T> {
    label?: string,
    options?: NomenclatorItem[],
    required?: boolean,
    multiple?: boolean,
}

export const LeadFormNomenclator = <T extends FieldValues>({ control, name, label, options,
    multiple = false, required = false, size = "medium", errorMessage, showAdornment = false }: LeadFormNomenclatorProps<T>) => {

    if (options && options.length > 0) {
        return (
            <ControlledAutocomplete control={control} name={name} label={label} options={options} returnField="id"
                getOptionLabel={option => option.value!} getOptionKey={option => `${option.id}`}
                required={required} size={size} multiple={multiple}
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
}
export const LeadFormCheckbox = <T extends FieldValues>({ control, name, label, options,
    multiple = false, required = false, size = "medium", errorMessage, showAdornment = false }: LeadFormCheckboxProps<T>) => {

    if (!options || options.length === 0) return null

    return (
        <FormControl variant="outlined" fullWidth>
            <InputLabel shrink>{label}</InputLabel>

            <OutlinedInput fullWidth notched label={label}
                sx={{ p: size === "medium" ? ".5rem 1rem" : "0 .5rem", cursor: "default" }}
                inputComponent={() => (
                    multiple ?
                        <ControlledGroupedCheckbox control={control} name={name} options={options}
                            returnField="id" keyField="id" getCheckboxLabel={option => option.value!}
                            required={required} errorMessage={errorMessage} row
                            startAdornment={showAdornment && < LeadFieldInputIcon typeCode="SELECTOR" subtypeCode="CHECKBOX_MULTIPLE" position="start" />} />
                        :
                        <ControlledRadio control={control} name={name} options={options}
                            returnField="id" keyField="id" isReturnInt getRadioLabel={option => option.value!}
                            required={required} errorMessage={errorMessage} row
                            startAdornment={showAdornment && < LeadFieldInputIcon typeCode="SELECTOR" subtypeCode="CHECKBOX_SIMPLE" position="start" />} />
                )} />

        </FormControl>
    )
}
