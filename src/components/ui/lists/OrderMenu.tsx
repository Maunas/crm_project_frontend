import React, { useId, useMemo, useState, type ReactNode } from 'react'
import CommonButton from '../buttons/CommonButton'
import { Badge, ButtonGroup, Collapse, Divider, List, ListItemButton, ListItemIcon, ListSubheader, Popover, Stack } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { SearchInput } from '../forms/SearchInput';
import type { OrderParams, OrderSearchParams } from 'src/types/shared';
import { FilterMenu } from './FilterMenu';

interface OrderMenuProps {
    id?: string,
    onOrderChange: (orderBy?: string, asc?: boolean, active?: boolean) => void,
    options: { label: string, name: string }[],
    defaultValues?: OrderParams & { only_active?: boolean },
    noCreator?: boolean,
    noUpdater?: boolean,
}

export const OrderMenu = ({ id = "order-menu", onOrderChange, options, defaultValues, noCreator = false, noUpdater = false }: OrderMenuProps) => {

    const [orderMenu, setOrderMenu] = useState<HTMLButtonElement | null>(null)
    const open = Boolean(orderMenu);

    const [orderBy, setOrderBy] = useState<string | undefined>(defaultValues?.order_by != null ? String(defaultValues.order_by) : undefined)
    const [asc, setAsc] = useState<boolean>(defaultValues?.ascending ?? true)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setOrderMenu(e.currentTarget)
    }
    const handleClose = () => {
        setOrderMenu(null)
    }

    const handleOrderByClick = (newOrderBy: string) => {
        const newValue = newOrderBy === orderBy ? undefined : newOrderBy
        setOrderBy(newValue)
        onOrderChange(newValue, asc)
    }

    const handleAscClick = (newAsc: boolean) => {
        if (asc === newAsc) return
        setAsc(newAsc)
        onOrderChange(orderBy, newAsc)
    }

    const fullOptions = useMemo(() => {
        return [...options,
        !noCreator && { name: "created_at", label: "Fecha de creación" },
        !noUpdater && { name: "updated_at", label: "Fecha de última actualización" }].filter(Boolean) as { name: string, label: string }[]
    }, [options, noCreator, noUpdater])


    if (fullOptions.length > 0) return (
        <>
            <CommonButton actionType='REORDER' variant='outlined' color="secondary" onlyTooltip
                onClick={handleClick} sx={{ ml: "auto" }}>
                Ordenar
            </CommonButton>
            <Popover
                id={id}
                open={open}
                anchorEl={orderMenu}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <List sx={{ maxHeight: "30rem", minWidth: "15rem", maxWidth: "25rem", overflowY: "auto" }} dense>
                    {fullOptions?.length > 0 && <>
                        <ListSubheader sx={{ backgroundColor: "transparent", lineHeight: "2rem" }} component="div" id={`${id}-subheader`}>
                            Ordenar por
                        </ListSubheader>
                        {fullOptions?.map(op =>
                            <ListItemButton onClick={() => handleOrderByClick(op.name)} key={op.name}>
                                <ListItemIcon>
                                    {orderBy === op.name && <CheckIcon fontSize='small' />}
                                </ListItemIcon>
                                {op.label}
                            </ListItemButton>
                        )}
                        <Divider sx={{ my: .5 }} />
                    </>
                    }
                    <ListItemButton onClick={() => handleAscClick(true)}>
                        <ListItemIcon>
                            {asc && <CheckIcon fontSize='small' />}
                        </ListItemIcon>
                        Orden Ascendente
                    </ListItemButton>
                    <ListItemButton onClick={() => handleAscClick(false)}>
                        <ListItemIcon>
                            {!asc && <CheckIcon fontSize='small' />}
                        </ListItemIcon>
                        Orden Descendente
                    </ListItemButton>
                </List>
            </Popover>
        </>
    )
}

interface OrderSearchProps {
    handleSearchChange: (search?: string | undefined, searchField?: string | undefined) => void,
    searchOptions?: {
        name: string;
        label: string;
        selectOptions?: { label: string, value: string }[]
    }[],
    handleOrderChange: (orderBy?: string | undefined, asc?: boolean, onlyActive?: boolean) => void,
    orderOptions?: {
        name: string;
        label: string;
    }[],
    handleFilterChange: (filters: Record<string, string>) => void,
    filterOptions?: {
        label: string;
        value: string;
        options: { label: string, value: string }[];
    }[],
    filterParams?: Record<string, string>,
    size?: "small" | "medium",
    defaultValues?: OrderSearchParams
    hiddenSelector?: boolean,
    children?: ReactNode,
    //Filter rules
    noCreator?: boolean,
    noUpdater?: boolean,
    noActive?: boolean,
    noDate?: boolean
}

export const OrderSearchMenu = ({
    searchOptions = [], handleSearchChange, orderOptions = [], handleOrderChange, filterOptions = [], filterParams = {}, handleFilterChange,
    size = "small", defaultValues, hiddenSelector = false, children,
    noCreator = false, noUpdater = false, noActive = false, noDate = false }: OrderSearchProps) => {

    const [openFilters, setOpenFilters] = useState<boolean>(false)

    //Id único por instancia para evitar ids HTML duplicados cuando hay dos OrderSearchMenu montados a la vez
    //(ej. lista principal + sidebar de detalles en NomenclatorItemList).
    const searchId = useId()

    const activeFilters = Object.values(filterParams).filter(Boolean).length > 0

    return (
        <Stack>
            <Stack direction="row" spacing={2} useFlexGap sx={{ width: "100%", alignItems: "center", flexWrap: "wrap" }}>
                {children}
                <Stack direction="row" spacing={2} useFlexGap sx={{ alignItems: "center", justifyContent: "end", justifySelf: "end", ml: "auto", flexWrap: "wrap", py: 1 }}>
                    {searchOptions.length > 0 &&
                        <SearchInput onSearch={handleSearchChange} id={`${searchId}-search`} options={searchOptions} size={size} defaultValues={defaultValues} hiddenSelector={hiddenSelector} />}
                    <ButtonGroup>
                        <OrderMenu onOrderChange={handleOrderChange} id={`${searchId}-order-menu`} options={orderOptions} defaultValues={defaultValues}
                            noCreator={noCreator} noUpdater={noUpdater} />
                        <Badge variant="dot" color='success' invisible={!activeFilters} >
                            <CommonButton actionType='FILTER' onlyTooltip color="secondary" variant='outlined' onClick={() => setOpenFilters(prev => !prev)}>
                                Filtros Avanzados
                            </CommonButton>
                        </Badge>
                    </ButtonGroup>
                </Stack>
            </Stack>
            <Collapse in={openFilters} timeout={200}>
                <FilterMenu existingFilters={filterParams} filterOptions={filterOptions} onSubmit={handleFilterChange} onClose={() => setOpenFilters(false)}
                    noCreator={noCreator} noUpdater={noUpdater} noActive={noActive} noDate={noDate} />
            </Collapse>
        </Stack >
    )
}
