import { useState } from 'react'
import { FormControl, MenuItem, TextField } from '@mui/material';
import ChipSelect from './ChipSelect'
import { useDebounce } from 'src/hooks/useDebounce';

interface OrderMenuProps {
    id?: string,
    onSearch: (search?: string, searchFields?: string) => void,
    options: { label: string, name: string }[],
    size: "medium" | "small"
}

export const SearchInput = ({ id = "search", onSearch, options, size = "medium" }: OrderMenuProps) => {

    const [search, setSearch] = useState<string | undefined>()
    const [searchFields, setSearchFields] = useState<string | undefined>(options[0].name)

    const handleSearchChange = (newValue: string) => {
        const searchValue = newValue === "" ? undefined : newValue
        setSearch(searchValue)
        onSearch(searchValue, searchFields)
    }

    const { debouncedFunction } = useDebounce()

    const handleFieldChange = (newField: string) => {
        setSearchFields(newField)
        onSearch(search, newField)
    }

    return (
        <>
            <FormControl fullWidth>
                <TextField
                    id={`${id}-input`}
                    label="Buscar"
                    onChange={(e) => debouncedFunction(() => handleSearchChange(e.target.value))}
                    size={size}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <ChipSelect
                                    labelId="demo-simple-select-label"
                                    id={`${id}-select`}
                                    value={searchFields}
                                    onChange={(e) => handleFieldChange(e.target.value)}
                                    size={size}
                                    disabled={options.length === 1}
                                    hidden={!options || options.length === 0}
                                >
                                    {options.map(op =>
                                        <MenuItem value={op.name} key={op.name}>{op.label}</MenuItem>
                                    )}
                                </ChipSelect>
                            )
                        }
                    }}
                />

            </FormControl>
        </>
    )
}
