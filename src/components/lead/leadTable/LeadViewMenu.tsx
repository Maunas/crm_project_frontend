import React, { useCallback, useEffect, useState } from 'react'
import { deleteView, getLeadViews } from "../leadService";
import { useListPagination } from "../../hooks/useListPagination";
import { PaginationComponent } from "../../common/lists/PaginationComponent";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortIcon from '@mui/icons-material/Sort';
import type { LeadView } from '../../../types/leads';
import type { Paginable } from '../../../types/common';
import { Button, IconButton, List, ListItem, ListItemButton, ListItemText, Popover, Stack, Typography } from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import WindowIcon from '@mui/icons-material/Window';
import TableChartIcon from '@mui/icons-material/TableChart';
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'

interface LeadViewMenuProps {
    saveView: (name: string, visibility: string, existingId?: number | undefined) => Promise<LeadView> | undefined;
    loadView: (view: LeadView) => void;
    campaignId: number
}

export const LeadViewMenu = ({ saveView, loadView, campaignId }: LeadViewMenuProps) => {
    const [viewAnchor, setViewAnchor] = React.useState<null | HTMLElement>(null);
    const open = Boolean(viewAnchor);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setViewAnchor(event.currentTarget);
    };
    const handleClose = () => {
        setViewAnchor(null);
    };

    const [currentViews, setCurrentViews] = useState<Paginable<LeadView> | null>(null)

    const { fetchPage, pageComponentProps, pageSize } = useListPagination(currentViews, 12)

    const fetchLeadViews = useCallback((page: number) => {
        return getLeadViews({ only_active: true, page_size: pageSize, page: page, campaign_id: campaignId })
            .then(setCurrentViews)
    }, [campaignId, pageSize])

    useEffect(() => {
        fetchLeadViews(fetchPage)
    }, [fetchPage, fetchLeadViews])

    const handleDelete = (viewId: number) => {
        if (!currentViews || currentViews.items.length === 0) return
        deleteView(viewId)
            .then(() => fetchLeadViews(fetchPage))
    }

    return (
        <>
            <Button onClick={handleClick}>Cargar Vista</Button>
            <Popover anchorEl={viewAnchor} open={open} onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}           >
                <Stack spacing={1}>
                    <Typography variant="h4" component="h3" sx={{ px: 2, pt: 2 }}>Vistas Creadas</Typography>
                    <List sx={{ maxHeight: "30rem", minWidth: "15rem", maxWidth: "25rem", overflowY: "auto" }} dense >
                        {currentViews?.items && currentViews?.items?.length > 0 &&
                            currentViews.items.map(view => (
                                <ListItem key={`list-${view.id}`} disablePadding
                                    secondaryAction={
                                        <Stack direction="row" sx={{ mr: -1 }}>
                                            <IconButton title="Cambiar Nombre" edge="end" size='small' onClick={() => { }}><EditIcon fontSize='small' /></IconButton>
                                            <IconButton title="Eliminar" edge="end" size='small' onClick={() => { handleDelete(view.id) }}><CloseIcon color='error' fontSize='small' /></IconButton>
                                        </Stack>
                                    }
                                >
                                    <ListItemButton onClick={() => loadView(view)} sx={{ py: .5 }}>
                                        <ListItemText sx={{ my: 0, mr: 4 }} secondary={
                                            <Stack spacing={3} direction="row" sx={{ justifyContent: "space-between" }}>
                                                {view.visibility}
                                                <Stack spacing={.5} direction="row" sx={{ flexWrap: "wrap", color: "text.secondary" }}>
                                                    {view.filters?.filters && view.filters?.filters.length > 0 &&
                                                        <FilterAltIcon fontSize="small" />
                                                    }
                                                    {view.sort_config?.order_by && view.sort_config?.ascending !== undefined &&
                                                        <SortIcon fontSize="small" />
                                                    }
                                                    {view.view_type === "TABLE" && <TableChartIcon fontSize="small" />}
                                                    {view.view_type === "LIST" && <FormatListBulletedIcon fontSize="small" />}
                                                    {view.view_type === "GRID" && <WindowIcon fontSize="small" />}
                                                </Stack>
                                            </Stack>}
                                            primary={view.name} />
                                    </ListItemButton>
                                </ListItem>
                            ))
                        }
                    </List >
                    {
                        pageComponentProps.totalPages > 1 &&
                        <PaginationComponent {...pageComponentProps} />
                    }
                    <Button onClick={() => { saveView("Vista Test", "PUBLIC") }} fullWidth>Crear Vista</Button>
                </Stack >
            </Popover>
        </>
    )
}
