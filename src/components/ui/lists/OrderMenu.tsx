import React, { useMemo, useState } from 'react'
import CommonButton from '../buttons/CommonButton'
import { Box, Divider, List, ListItemButton, ListItemIcon, ListSubheader, Popover, Stack } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { SearchInput } from '../forms/SearchInput';
import type { OrderParams, OrderSearchParams } from 'src/types/shared';

interface OrderMenuProps {
    id?: string,
    onOrderChange: (orderBy?: string, asc?: boolean, active?: boolean) => void,
    options: { label: string, name: string }[],
    canFilterActive?: boolean,
    defaultValues?: OrderParams & { only_active?: boolean }
}

export const OrderMenu = ({ id = "order-menu", onOrderChange, options, canFilterActive = false, defaultValues }: OrderMenuProps) => {

    const [orderMenu, setOrderMenu] = useState<HTMLButtonElement | null>(null)
    const open = Boolean(orderMenu);

    const [orderBy, setOrderBy] = useState<string | undefined>(defaultValues?.order_by != null ? String(defaultValues.order_by) : undefined)
    const [asc, setAsc] = useState<boolean>(defaultValues?.ascending ?? true)
    const [active, setActive] = useState<boolean>(defaultValues?.only_active ?? false)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setOrderMenu(e.currentTarget)
    }
    const handleClose = () => {
        setOrderMenu(null)
    }

    const handleOrderByClick = (newOrderBy: string) => {
        const newValue = newOrderBy === orderBy ? undefined : newOrderBy
        setOrderBy(newValue)
        onOrderChange(newValue, asc, active)
    }

    const handleAscClick = (newAsc: boolean) => {
        if (asc === newAsc) return
        setAsc(newAsc)
        onOrderChange(orderBy, newAsc, active)
    }
    const handleActiveClick = () => {
        const prev = active
        setActive(!prev)
        onOrderChange(orderBy, asc, !prev)
    }

    const fullOptions = useMemo(() => {
        return [...options,
        { name: "created_at", label: "Fecha de creación" },
        { name: "updated_at", label: "Fecha de última actualización" },]
    }, [options])

    return (
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
                    {canFilterActive && <>
                        <Divider sx={{ my: .5 }} />
                        <ListItemButton onClick={handleActiveClick}>
                            <ListItemIcon>
                                {active && <CheckIcon fontSize='small' />}
                            </ListItemIcon>
                            Solo elementos habilitados
                        </ListItemButton>
                    </>}
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
    size?: "small" | "medium",
    defaultValues?: OrderSearchParams
    hiddenSelector?: boolean,
}

export const OrderSearchMenu = ({ searchOptions = [], handleSearchChange, orderOptions = [], handleOrderChange, size = "small", defaultValues, hiddenSelector = false }: OrderSearchProps) => {
    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{ alignItems: "center", justifyContent: "end", justifySelf: "end", ml: "auto", flexWrap: "wrap", py: 1 }}>
            <SearchInput onSearch={handleSearchChange} id='nom-item-search' options={searchOptions} size={size} defaultValues={defaultValues} hiddenSelector={hiddenSelector} />
            <Box>
                <OrderMenu onOrderChange={handleOrderChange} id='nom-item-order-menu' options={orderOptions} canFilterActive defaultValues={defaultValues} />
            </Box>
        </Stack>
    )
}
