import { Checkbox } from '@mui/material'
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
