import { useLayoutEffect, useRef, useState } from 'react'
import { Box, MenuItem, TextField } from '@mui/material';
import ChipSelect from './ChipSelect'
import { useDebounce } from 'src/hooks/useDebounce';
import { ChipTooltip } from '../details/ChipTooltip';
import type { SearchParams } from 'src/types/shared';

interface SearchInputProps {
    id?: string,
    onSearch: (search?: string, searchFields?: string) => void,
    options?: { label: string, name: string }[],
    size?: "medium" | "small",
    defaultValues?: SearchParams,
    hiddenSelector?: boolean,
}

export const SearchInput = ({ id = "search", onSearch, options = [], size = "medium", defaultValues, hiddenSelector = false }: SearchInputProps) => {

    const [search, setSearch] = useState<string | undefined>(defaultValues?.search)
    const [searchFields, setSearchFields] = useState<string | undefined>(defaultValues?.search_fields ?? (options.length > 0 ? options[0].name : undefined))

    const selectorRef = useRef<HTMLDivElement>(null)
    const [selectorWidth, setSelectorWidth] = useState<number>(0)

    useLayoutEffect(() => {
        if (hiddenSelector || !selectorRef.current) return
        const { width } = selectorRef.current.getBoundingClientRect()
        setSelectorWidth(width)
    }, [hiddenSelector, searchFields, size])

    const handleSearchChange = (newValue: string) => {
        const searchValue = newValue === "" ? undefined : newValue
        setSearch(searchValue)
        onSearch(searchValue, searchFields)
    }

    const { debouncedFunction } = useDebounce()

    const handleFieldChange = (newField: string) => {
        setSearchFields(newField)
        if (search) onSearch(search, newField)
    }

    return (
        <Box sx={{ position: "relative", maxWidth: "20rem", minWidth: "15rem", flex: 1 }}>
            <TextField
                id={`${id}-input`}
                label="Buscar"
                onChange={(e) => debouncedFunction(() => handleSearchChange(e.target.value))}
                size={size}
                fullWidth
                defaultValue={defaultValues?.search}
                slotProps={{
                    input: {
                        sx: {
                            pr: `${selectorWidth}px`
                        }
                    }
                }}
            />
            {!hiddenSelector &&
                <Box ref={selectorRef} sx={{ position: "absolute", top: "50%", right: ".5rem", transform: "translateY(-50%)" }}>
                    {options.length === 1 ?
                        <ChipTooltip title="No hay más opciones" color='primary' boxed>
                            <SelectField id={id} options={options} size={size} handleFieldChange={handleFieldChange} searchFields={searchFields} />
                        </ChipTooltip>
                        :
                        <SelectField id={id} options={options} size={size} handleFieldChange={handleFieldChange} searchFields={searchFields} />
                    }
                </Box>}

        </Box>
    )
}


interface SelectFieldProps {
    id?: string,
    options: { label: string, name: string }[],
    size?: "medium" | "small",
    handleFieldChange: (newField: string) => void,
    searchFields: string | undefined,
}
const SelectField = ({ id, options, size, handleFieldChange, searchFields }: SelectFieldProps) => {
    return <ChipSelect
        labelId={`${id}-select`}
        id={`${id}-select`}
        value={searchFields}
        onChange={(e) => handleFieldChange(e.target.value)}
        size={size}
        disabled={options && options.length === 1}
        hidden={!options || options.length === 0}
    >
        {options.map(op =>
            <MenuItem value={op.name} key={op.name}>{op.label}</MenuItem>
        )}
    </ChipSelect>
}