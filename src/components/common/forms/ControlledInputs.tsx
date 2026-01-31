import { Checkbox, FormControlLabel, Radio, RadioGroup, TextField } from '@mui/material'
import { Controller, type Control } from 'react-hook-form'

interface ControlledCheckboxProps {
    control: Control,
    name: string
}

export const ControlledCheckbox = ({ control, name }: ControlledCheckboxProps) => {
    return (
        <Controller name={name} control={control}
            render={({ field }) => (
                <Checkbox
                    {...field}
                    checked={field.value ?? false}
                />
            )}
        >
        </Controller >
    )
}

interface ControlledRadioProps {
    control: Control,
    name: string,
    row?: boolean,
    options: {
        label: string,
        value: string
    }[]
}
export const ControlledRadio = ({ control, name, row = true, options }: ControlledRadioProps) => {
    return (
        <Controller control={control} name={name}
            render={({ field }) =>
                <RadioGroup row={row}
                    {...field}
                >
                    {options?.length > 0 &&
                        options.map((option) =>
                            <FormControlLabel key={option.label} value={option.value}
                                control={<Radio />} label={option.label} />
                        )}
                </RadioGroup>
            }>
        </Controller>
    )
}

interface ControlledTextProps {
    control: Control,
    name: string,
    label: string,
    id?: string
}
export const ControlledTextInput = ({ control, name, label, id }: ControlledTextProps) => {
    return (
        <Controller control={control} name={name}
            render={({ field }) =>
                <TextField
                    {...field}
                    id={id ?? name}
                    label={label ?? name}
                    value={field.value ?? ""}
                    fullWidth
                />
            }>
        </Controller>
    )
}