import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Autocomplete, Box, MenuItem, TextField } from '@mui/material';
import ChipSelect from './ChipSelect'
import { useDebounce } from 'src/hooks/useDebounce';
import { ChipTooltip } from '../details/ChipTooltip';
import type { SearchParams } from 'src/types/shared';

interface SearchInputProps {
    id?: string,
    onSearch: (search?: string, searchFields?: string) => void,
    options?: {
        name: string;
        label: string;
        searchOptions?: { label: string, value: string }[]
    }[],
    size?: "medium" | "small",
    defaultValues?: SearchParams,
    hiddenSelector?: boolean,
}

export const SearchInput = ({ id = "search", onSearch, options = [], size = "medium", defaultValues, hiddenSelector = false }: SearchInputProps) => {

    const [search, setSearch] = useState<string | undefined>(defaultValues?.search)
    const [searchFields, setSearchFields] = useState<string | undefined>(defaultValues?.search_fields ?? (options.length > 0 ? options[0].name : undefined))

    const selectedOption = useMemo(
        () => options?.find(o => o.name === searchFields),
        [options, searchFields]
    )

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

    const handleSelectSearchOption = (newValue: string | null) => {
        setSearch(newValue ?? undefined)
        onSearch(newValue ?? undefined, searchFields)
    }

    const { debouncedFunction } = useDebounce()

    const handleFieldChange = (newField: string) => {
        setSearchFields(newField)
        //Si el nuevo campo tiene subopciones, se borra el valor para evitar  comportamiento inesperado
        //Si no, busca el mismo valor en el nuevo campo
        const newOption = options?.find(o => o.name === newField)
        if (newOption?.searchOptions) {
            setSearch(undefined)
            onSearch(undefined, newField)
        } else if (search) {
            alert(search)
            onSearch(search, newField)
        }
    }

    return (
        <Box sx={{ position: "relative", maxWidth: "20rem", minWidth: "15rem", flex: 1 }}>
            {selectedOption?.searchOptions ?
                <Autocomplete
                    options={selectedOption.searchOptions}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    onChange={(_, newValue) => handleSelectSearchOption(newValue?.value ?? null)}
                    value={selectedOption.searchOptions.find(o => o.value === search) ?? null}
                    forcePopupIcon={false}
                    slotProps={{
                        clearIndicator: {
                            sx: {
                                mr: `${selectorWidth}px`,
                            }
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Buscar"
                            size={size}
                            slotProps={{
                                ...params.slotProps,
                                input: {
                                    ...params.slotProps?.input,
                                    sx: { pr: `calc(${selectorWidth}px + 2rem) !important` },
                                }
                            }}
                        />
                    )}
                    size={size}
                    fullWidth
                />
                :
                <TextField
                    id={`${id}-input`}
                    label="Buscar"
                    onChange={(e) => debouncedFunction(() => handleSearchChange(e.target.value))}
                    size={size}
                    fullWidth
                    defaultValue={search}
                    slotProps={{
                        input: {
                            sx: {
                                pr: `${selectorWidth}px`,
                            }
                        }
                    }}
                />}
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