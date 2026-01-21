import { Autocomplete, TextField } from '@mui/material'
import { Controller, type Control } from 'react-hook-form'

interface ControlledACProps {
    optionList: object[],
    label: string,
    name: string,
    control: Control,
    getOptionLabel: (option: object) => string,
    getOptionKey: (option: object) => string,
    returnField?: string | null,
    sx?: object | null
}

export const ControlledAutocomplete = ({ optionList, label, name, control, getOptionLabel, getOptionKey, returnField = null, sx = {} }: ControlledACProps) => {
    return (
        <Controller name={name} control={control}
            render={({ field }) => (
                <Autocomplete
                    {...field}
                    disablePortal
                    options={optionList}
                    renderInput={(params) => <TextField {...params} label={label} sx={sx} />}
                    getOptionLabel={getOptionLabel}
                    getOptionKey={getOptionKey}
                    onChange={(_, value) => {
                        //Si se especifica el returnField, se devuelve un campo específico, si no, devuelve el objeto entero
                        if (returnField === null) field.onChange(value ?? null)
                        else field.onChange(value[returnField] ?? null)
                    }}
                    value={
                        //Si se especifica el returnField, se devuelve un campo específico, si no, devuelve el objeto entero
                        returnField === null ? field.value ?? null :
                            optionList.find((item) => field.value === item[returnField]) ?? null
                    }
                />
            )}
        >
        </Controller>
    )
}
