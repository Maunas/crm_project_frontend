import { memo, useCallback, useEffect, useState } from 'react'
import { NomenclatorFormSidebar } from './NomenclatorForm'
import { NomenclatorDetails } from './NomenclatorDetails'
import ContainerWithSidebar from 'shared/layout/container/GenericContainer'
import { DisableConfirmDialog } from 'shared/feedback/ConfirmationDialog'
import { CommonIconButton } from 'shared/ui/buttons/CommonIconButton'
import PaginationComponent from 'shared/ui/lists/PaginationComponent'
import LoadingScreenWrapper from 'shared/feedback/LoadingScreen'
import { CustomListItem } from 'shared/ui/lists/CustomListItem'
import CommonButton from 'shared/ui/buttons/CommonButton'
import { EnabledIcon } from 'shared/ui/lists/Icons'
import { useListPagination } from 'src/hooks/useListPagination'
import { useSidebar } from 'src/hooks/useSidebar'
import { useLoading } from 'src/hooks/useLoading'
import type { NomenclatorDetailed } from 'src/types/nomenclators'
import type { Paginable } from 'src/types/shared'
import { disableNomenclator, enableNomenclator, getNomenclator, getNomenclators } from './nomenclatorService'
import { showCommonErrorToast, showToast } from 'src/utils/feedback'
import { useUserContext } from 'src/stores/UserContext'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const NomenclatorList = () => {

    const { activeOrg } = useUserContext()

    const [nomenclators, setNomenclators] = useState<Paginable<NomenclatorDetailed> | null>(null)

    const [params, setParams] = useSearchParams()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<NomenclatorDetailed>("id", params, setParams, getNomenclator, "DETAILS_NOM")

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(nomenclators)

    const fetchNom = useCallback((fetchPage: number, pageSize: number) => {
        return getNomenclators({ only_active: false, detailed: true, page: fetchPage, page_size: pageSize })
            .then(setNomenclators)
    }, [])

    const { loading, fnWithLoading: fetchNomLoad } = useLoading(fetchNom)

    useEffect(() => {
        fetchNomLoad(fetchPage, pageSize)
    }, [fetchPage, pageSize, activeOrg, fetchNomLoad])


    const updateEntityOnList = useCallback((entity: NomenclatorDetailed | null, mode: string) => {
        switch (mode) {
            case "CREATE_NOM": {
                getNomenclators({ detailed: true, page_size: pageSize, only_active: false, page: nomenclators?.page }).then(setNomenclators)
                break;
            }
            case "UPDATE_NOM": {
                const newNom = entity as NomenclatorDetailed
                return setNomenclators(prevList => {
                    if (!prevList || prevList.items.length === 0) return prevList
                    const nomenclatorItems = [...prevList.items]
                    const nomIdx = nomenclatorItems.findIndex(nom => nom.id === newNom.id)
                    if (nomIdx === -1) return prevList
                    nomenclatorItems[nomIdx] = newNom
                    return { ...prevList, items: [...nomenclatorItems] }
                })
            }
            case "DELETE_NOM": {
                if (selectedEntity && entity?.id === selectedEntity.id) closeSidebar()
                getNomenclators({ detailed: true, page_size: pageSize, only_active: false, page: nomenclators?.page }).then(setNomenclators)
                break;
            }
        }
    }, [closeSidebar, nomenclators?.page, pageSize, selectedEntity])

    const handleActive = useCallback(async (nom: NomenclatorDetailed | null) => {
        if (!nom) return
        const updateActive = (nom: NomenclatorDetailed) => {
            updateEntityOnList({ ...nom, active: !nom.active }, "UPDATE_NOM")
            if (selectedEntity?.id === nom.id) {
                handleSidebar("KEEP", { ...selectedEntity, active: !nom.active })
            }
        }
        const deleteNom = (nom: NomenclatorDetailed) => {
            updateEntityOnList(nom, "DELETE_NOM")
            if (selectedEntity?.id === nom.id) {
                closeSidebar()
            }
        }
        if (nom.active) {
            return disableNomenclator(nom.id).then(res => {
                if (res.action === "disabled") {
                    updateActive(nom)
                    showToast(`"${nom.name}" deshabilitado con éxito.`)
                }
                if (res.action === "deleted") {
                    deleteNom(nom)
                    showToast(`"${nom.name}" eliminado definitivamente.`)
                }
            })
                .catch(e => showCommonErrorToast(e))
        } else {
            return enableNomenclator(nom.id).then(() => {
                updateActive(nom)
                showToast(`"${nom.name}" habilitado con éxito.`)
            })
                .catch(e => showCommonErrorToast(e))
        }
    }, [closeSidebar, handleSidebar, selectedEntity, updateEntityOnList])

    const [deletingNom, setDeletingNom] = useState<NomenclatorDetailed | null>(null)
    const handleDeletingNom = (deletingNom: NomenclatorDetailed) => {
        setDeletingNom(deletingNom)
    }

    return (
        <ContainerWithSidebar isSidebarOpen={Boolean(sidebarMode)} closeSidebar={closeSidebar} sidebarComponent={
            <NomenclatorSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList}
                handleActive={handleDeletingNom} />
        }>
            <Stack spacing={3}>
                <Stack direction="row" useFlexGap spacing={2} sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                    <Typography variant="h1">Lista de Nomencladores</Typography>
                    {nomenclators && nomenclators.items?.length > 0 &&
                        <CommonButton actionType="CREATE" onClick={() => { handleSidebar("CREATE_NOM", null) }}
                            sx={{ marginLeft: "auto" }} onlyTooltip>
                            Agregar
                        </CommonButton>
                    }
                </Stack>
                <LoadingScreenWrapper loading={loading}>
                    <Stack spacing={2}>
                        {
                            nomenclators && nomenclators.items?.length > 0 ?
                                <List>
                                    {nomenclators.items.map(nom =>
                                        <CustomListItem key={nom.id} isSelected={nom.id === selectedEntity?.id} disablePadding secondaryAction={
                                            <Stack direction="row" sx={{ alignItems: "center" }}>
                                                <CommonIconButton actionType='DETAILS' title='Detalle' onClick={() => handleSidebar("DETAILS_NOM", nom)} tooltipSize='small' size="small" />
                                                <CommonIconButton actionType='LIST' title='Ver Items' component={RouterLink} to={`/nomenclators/${nom.id}`} tooltipSize='small' size="small" />
                                                {(nom.organization_id || activeOrg?.id === 0) &&
                                                    <>
                                                        <CommonIconButton actionType='MODIFY' title='Modificar' onClick={() => handleSidebar("UPDATE_NOM", nom)} tooltipSize='small' size="small" />
                                                        <CommonIconButton actionType={nom.active ? "DISABLE" : "ENABLE"} tooltipSize="small" size="small"
                                                            title={nom.active ? "Deshabilitar" : "Habilitar"}
                                                            onClick={() => handleDeletingNom(nom)} color={nom.active ? "error" : "success"} />
                                                    </>}
                                            </Stack>
                                        }>
                                            <ListItemButton onClick={() => handleSidebar("DETAILS_NOM", nom)} >
                                                <ListItemText sx={{ mr: 10 }} primary={
                                                    <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
                                                        <EnabledIcon active={nom.active} />
                                                        <Typography sx={{ fontWeight: "bold" }}>{nom.name}</Typography>
                                                        {nom.parent_nomenclator &&
                                                            <>
                                                                <ArrowBackIcon />
                                                                <Typography variant="subtitle2">
                                                                    {nom.parent_nomenclator.name}
                                                                </Typography>
                                                            </>
                                                        }
                                                    </Stack>
                                                }
                                                    secondary={!nom.organization_id &&
                                                        <span style={{ fontStyle: "italic" }}>Nomenclador del Sistema</span>
                                                    } />
                                            </ListItemButton>
                                        </CustomListItem>
                                    )}
                                </List>
                                : <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
                                    <Typography variant="h4">No se han encontrado nomencladores...</Typography>
                                    <CommonButton actionType="CREATE" onClick={() => { handleSidebar("CREATE_NOM", null) }} variant="contained">
                                        Agregar
                                    </CommonButton>
                                </Stack>
                        }
                        <PaginationComponent {...pageComponentProps} />
                    </Stack>
                </LoadingScreenWrapper>
                <DisableConfirmDialog entity={deletingNom} clearEntity={() => setDeletingNom(null)} idModal='dis-nom-list'
                    onConfirm={() => handleActive(deletingNom)} entityTypeName='el nomenclador' />
            </Stack>
        </ContainerWithSidebar >
    )
}

interface SidebarProps {
    mode: string | null,
    entity: NomenclatorDetailed | null,
    closeSidebar: () => void,
    updateEntityOnList: (
        entity: NomenclatorDetailed | null,
        mode: string,
    ) => void,
    handleSidebar: (mode: string, entity: NomenclatorDetailed | null) => void,
    handleActive: (entity: NomenclatorDetailed) => void
}
const NomenclatorSidebar = memo(({ mode, entity, closeSidebar, updateEntityOnList, handleSidebar, handleActive }: SidebarProps) => {

    switch (mode) {
        case "CREATE_NOM":
            return <NomenclatorFormSidebar closeSidebar={closeSidebar}
                updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "UPDATE_NOM":
            return <NomenclatorFormSidebar existingNom={entity as NomenclatorDetailed} closeSidebar={closeSidebar}
                updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "DETAILS_NOM":
            return <NomenclatorDetails entity={entity as NomenclatorDetailed} closeSidebar={closeSidebar}
                handleSidebar={handleSidebar} handleActive={handleActive} />
    }

})