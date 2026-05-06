import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { deleteView, getLeadViews } from "../leadService";
import { useListPagination } from "src/hooks/useListPagination";
import { PaginationComponent } from "../../../components/ui/lists/PaginationComponent";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SortIcon from '@mui/icons-material/Sort';
import type { LeadView, LeadViewParams } from '../../../types/leads';
import { type DictionaryItem, type Paginable } from '../../../types/shared';
import { Button, IconButton, TextField, List, ListItem, ListItemButton, ListItemText, Popover, Stack, Typography } from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import WindowIcon from '@mui/icons-material/Window';
import TableChartIcon from '@mui/icons-material/TableChart';
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import { useForm, useWatch } from 'react-hook-form';
import { getDictionaries } from '../../../services/generalService';
import { ControlledRadio } from "../../../components/ui/forms/CustomMultipleInputs";
import { FormErrorMessage } from "../../../components/ui/forms/FormFeedback";
import { setFormErrors } from "../../../services/generalService";
import CommonButton from 'src/components/ui/buttons/CommonButton';
import { ChipTooltip } from '../../../components/ui/details/ChipTooltip';

interface LeadViewMenuProps {
    saveView: (name: string, visibility: string, existingView?: LeadView) => Promise<LeadView> | undefined;
    loadView: (view: LeadView) => void;
    currentView: LeadViewParams | undefined;
    campaignId: number
}

export const LeadViewMenu = ({ saveView, loadView, campaignId, currentView }: LeadViewMenuProps) => {
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

    const handleCreate = (name: string, visibility: string, existingView?: LeadView | undefined) => {
        return saveView(name, visibility, existingView)?.then(() => fetchLeadViews(fetchPage))
    }

    const menuRef = useRef(null)

    const [viewFormAnchor, setViewFormAnchor] = React.useState<null | HTMLElement>(null);

    const [visibilities, setVisibilities] = useState<DictionaryItem[]>([])
    useEffect(() => {
        getDictionaries(['lead_view_visibilities']).then(res => setVisibilities(res.lead_view_visibilities!))
    }, [])

    const [editView, setEditView] = useState<undefined | LeadView>(undefined)
    const handleEditView = (view: LeadView) => {
        setEditView(view)
        setViewFormAnchor(menuRef.current)
    }
    const handleCloseForm = () => {
        setEditView(undefined)
        setViewFormAnchor(null)
    }

    const selectedView = useMemo(() => editView ?? currentView, [editView, currentView])

    return (
        <>
            <ChipTooltip title='Vistas' color="primary">
                <CommonButton variant="outlined" actionType='SETTINGS' color="primary" onClick={handleClick} />
            </ChipTooltip>
            <Popover anchorEl={viewAnchor} open={open} onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}           >
                <Stack spacing={1} ref={menuRef}>
                    <Typography variant="h4" component="h3" sx={{ px: 2, pt: 2 }}>Vistas Creadas</Typography>
                    <List sx={{ maxHeight: "30rem", minWidth: "15rem", maxWidth: "25rem", overflowY: "auto" }} dense >
                        {currentViews?.items && currentViews?.items?.length > 0 &&
                            currentViews.items.map(view => (
                                <ListItem key={`list-${view.id}`} disablePadding
                                    secondaryAction={
                                        <Stack direction="row" sx={{ mr: -1 }}>
                                            <IconButton title="Renombrar" edge="end" size='small' onClick={() => { handleEditView(view) }}><EditIcon fontSize='small' /></IconButton>
                                            <IconButton title="Eliminar" edge="end" size='small' onClick={() => { handleDelete(view.id) }}><CloseIcon color='error' fontSize='small' /></IconButton>
                                        </Stack>
                                    }
                                >
                                    <ListItemButton onClick={() => loadView(view)} sx={{ py: .5 }}>
                                        <ListItemText sx={{ my: 0, mr: 4 }} secondary={
                                            <Stack spacing={3} direction="row" sx={{ justifyContent: "space-between" }}>
                                                {visibilities.find(i => i.code === view.visibility)?.label}
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
                    <Button onClick={() => setViewFormAnchor(menuRef.current)} fullWidth>Crear Vista</Button>
                </Stack >
            </Popover>
            <ViewForm existingView={editView} visibilities={visibilities} formAnchor={viewFormAnchor} handleClose={handleCloseForm} handleCreate={handleCreate} >
                {selectedView && "si."}
            </ViewForm>
        </>
    )
}

interface ViewFormProps {
    existingView?: LeadView,
    formAnchor: null | HTMLElement,
    handleClose: () => void,
    visibilities: DictionaryItem[]
    handleCreate: (name: string, visibility: string, existingView?: LeadView) => Promise<void> | undefined;
    children?: React.ReactNode
}

interface LeadViewCreate {
    name: string,
    visibility: string,
    team_id: number
}

export const ViewForm = ({ existingView, visibilities, formAnchor, handleClose, handleCreate, children }: ViewFormProps) => {

    const defaultValues = useMemo(() => ({
        name: existingView?.name ?? "",
        visibility: existingView?.visibility ?? "PRIVATE",
        team_id: undefined
    }), [existingView])


    const { register, control, formState: { errors }, reset, handleSubmit, setError } = useForm<LeadViewCreate>({
        defaultValues
    })

    useEffect(() => { reset(defaultValues) }, [defaultValues, reset])

    const onSubmit = (data: LeadViewCreate) => {
        handleCreate(data.name, data.visibility, existingView)?.then(() => {
            reset(defaultValues)
            handleClose()
        })
            .catch(e => setFormErrors(e, setError))
    }

    const visibility = useWatch({ control, name: "visibility" })

    return (
        <Popover
            disableScrollLock
            disableAutoFocus
            id="basic-menu"
            anchorEl={formAnchor}
            open={Boolean(formAnchor)}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            <Stack spacing={2} sx={{ p: 2 }}>
                <Typography variant="h4" component="h3">{existingView ? `Renombrar "${existingView.name}"` : "Crear Vista"}</Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={1}>
                        <Stack spacing={.5}>
                            <TextField id="viewtag-name" label="Nombre" size="small" {...register("name")} />
                            {errors?.name?.message && <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>}
                        </Stack>
                        {!existingView && <>
                            <ControlledRadio control={control} label="Visibilidad" name="visibility" options={visibilities}
                                errorMessage={errors?.visibility?.message} row returnField="code" getRadioLabel={option => option.label}
                                keyField="code" />
                            {visibility === "TEAM" &&
                                <>
                                    <TextField id="viewtag-team-id" label="Equipo" size="small" {...register("team_id")} />
                                    {errors?.team_id?.message && <FormErrorMessage>{errors?.team_id?.message}</FormErrorMessage>}
                                </>
                            }
                        </>}
                        {children}
                        {errors?.root?.message &&
                            <FormErrorMessage>{errors?.root?.message}</FormErrorMessage>}
                        <Stack spacing={.5}>
                            <Button onClick={handleClose}>Cancelar</Button>
                            <Button variant="contained" type="submit">Guardar</Button>
                        </Stack>
                    </Stack>
                </form>
            </Stack>
        </Popover >
    )
}
