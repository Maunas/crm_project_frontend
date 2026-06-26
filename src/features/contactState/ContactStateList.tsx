import { useCallback, useEffect, useState } from 'react'
import { ContactStateForm } from './ContactStateForm'
import { DisableConfirmDialog } from 'shared/feedback/ConfirmationDialog'
import PaginationComponent from 'shared/ui/lists/PaginationComponent'
import { ResponsiveListItem } from 'shared/ui/lists/CustomListItem'
import LoadingScreenWrapper from 'shared/feedback/LoadingScreen'
import GenericPaper from 'shared/layout/container/GenericPaper'
import CommonButton from 'shared/ui/buttons/CommonButton'
import CustomChip from 'shared/ui/details/CustomChip'
import { EnabledIcon } from 'shared/ui/lists/Icons'
import { useListPagination } from 'src/hooks/useListPagination'
import { useLoading } from 'src/hooks/useLoading'
import type { LeadContactStateDetailed } from 'src/types/contactState'
import type { Paginable } from 'src/types/shared'
import { getContactStates } from './contactStatesServices'
import { disableLeadContactState, enableLeadContactState } from 'src/services/leadContactStateService'
import { showCommonErrorToast, showToast } from 'src/utils/feedback'
import { Divider, Grid, ListItemText, Stack, Typography } from '@mui/material'

export const ContactStateList = () => {

    const [states, setStates] = useState<Paginable<LeadContactStateDetailed> | null>(null)

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(states)

    const fetchStates = useCallback((fetchPage: number, pageSize: number) => {
        return getContactStates({
            detailed: true, only_active: false,
            page: fetchPage, page_size: pageSize
        })
            .then(setStates)
            .catch(e => showCommonErrorToast(e, "Error recuperando la lista de estados"))
    }, [])

    const { fnWithLoading: fetchStatesLoad, loading } = useLoading(fetchStates)

    useEffect(() => {
        fetchStatesLoad(fetchPage, pageSize)
    }, [fetchStatesLoad, fetchPage, pageSize])

    const [editingState, setEditingState] = useState<LeadContactStateDetailed | null | undefined>(null)

    const updateList = useCallback((entity?: LeadContactStateDetailed, update: boolean = false) => {
        if (update) {
            if (!states || !entity) return
            const statesCopy = [...states.items]
            const idx = statesCopy.findIndex(state => entity.id === state.id)
            if (idx === -1) return
            statesCopy[idx] = entity
            return setStates({ ...states, items: statesCopy })

        } else fetchStatesLoad(fetchPage, pageSize)
    }, [fetchPage, fetchStatesLoad, pageSize, states])

    return (
        <Stack spacing={2}>
            <LoadingScreenWrapper loading={loading}>
                <Stack spacing={2}>
                    {(states?.items && states.items.length > 0) ?
                        <Stack spacing={2}>
                            <CommonButton actionType="CREATE" variant="contained" sx={{ alignSelf: "start" }}
                                onClick={() => setEditingState(undefined)}>Agregar</CommonButton>
                            <ContactStateListData states={states.items}
                                toggleUpdate={(state: LeadContactStateDetailed) => setEditingState(state)}
                                updateList={updateList} />
                            <PaginationComponent {...pageComponentProps} />
                        </Stack>
                        :
                        <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center", height: "30rem" }}>
                            <Typography variant="h4">No se han encontrado estados de contacto...</Typography>
                            <CommonButton actionType="CREATE" variant="contained"
                                onClick={() => setEditingState(undefined)}>Agregar</CommonButton>
                        </Stack>
                    }
                    {editingState !== null &&
                        <>
                            <Divider />
                            <GenericPaper elevation={4} sx={{ px: 3, py: 2 }}>
                                <Stack spacing={2}>
                                    <ContactStateForm existingState={editingState}
                                        onClose={() => setEditingState(null)} onSubmit={updateList} />
                                </Stack>
                            </GenericPaper>
                        </>
                    }
                </Stack>
            </LoadingScreenWrapper >
        </Stack>
    )
}

interface ContactStateListDataProps {
    states: LeadContactStateDetailed[],
    toggleUpdate: (state: LeadContactStateDetailed) => void,
    updateList: (entity?: LeadContactStateDetailed, update?: boolean) => void
}

export const ContactStateListData = ({ states, toggleUpdate, updateList }: ContactStateListDataProps) => {

    const [disableState, setDisableState] = useState<LeadContactStateDetailed | null>(null)

    const handleEnableDisable = useCallback((id: number, isActive: boolean) => {
        if (!isActive) {
            return enableLeadContactState(id)
                .then(() => {
                    showToast("Estado habilitado correctamente.", "success")
                    updateList()
                })
                .catch(e => { showCommonErrorToast(e, "Error habilitando el estado.") })
        }
        return disableLeadContactState(id)
            .then(res => {
                if (res.action === "disabled") showToast("Estado deshabilitado correctamente.", "success")
                else showToast("Estado eliminado permanentemente.", "success")
                updateList()
            })
            .catch(e => { showCommonErrorToast(e, "Error deshabilitando el estado.") })
    }, [updateList])

    return (
        <>
            <Grid container sx={{ marginInline: 1, alignItems: "stretch" }}>
                {states.map((state, idx) =>
                    <Grid key={`state-${idx}`} size="grow" sx={{ minWidth: "15rem", minHeight: "100%" }}>
                        <ResponsiveListItem disablePadding sx={{ height: "100%" }}
                            onClick={() => toggleUpdate(state)}
                            actions={[
                                { actionType: "MODIFY", label: "Editar", onClick: () => toggleUpdate(state) },
                                {
                                    actionType: state.active ? "DISABLE" : "ENABLE", color: state.active ? "error" : "success",
                                    label: state.active ? "Deshabilitar" : "Habilitar",
                                    onClick: () => setDisableState(state)
                                }
                            ]}>
                            <ListItemText sx={{ mr: 4 }} primary={
                                <Stack spacing={1} direction="row" color="inherit" sx={{ width: "100%", alignItems: "center" }}>
                                    <EnabledIcon active={state.active} />
                                    <Typography sx={{ fontWeight: "500" }} color="inherit">{state.name}</Typography>
                                    {state.is_initial &&
                                        <CustomChip chipColor='info' label="Inicial" size="small" />}
                                </Stack>
                            } />
                        </ResponsiveListItem>
                    </Grid>
                )}
            </Grid >
            {disableState &&
                <DisableConfirmDialog idModal='conf-delete-contact' entity={disableState} clearEntity={() => setDisableState(null)} entityTypeName="el estado"
                    onConfirm={() => handleEnableDisable(disableState?.id, disableState?.active)} />
            }
        </>
    )
}
