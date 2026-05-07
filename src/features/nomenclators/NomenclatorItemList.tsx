import { memo, useCallback, useContext, useEffect, useState } from 'react'
import type { UserContextItems } from '../users/UserProvider'
import type { Paginable } from '../../types/shared'
import { ButtonGroup, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import PaginationComponent from 'src/components/ui/lists/PaginationComponent'
import { disableNomenclatorItem, enableNomenclatorItem, getNomenclator, getNomenclatorItem, getNomenclatorItems } from './nomenclatorService'
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom'
import { NomenclatorItemDetails } from './NomenclatorItemDetails'
import type { NomenclatorDetailed, NomenclatorItemDetailed } from '../../types/nomenclators'
import { NomenclatorItemFormSidebar } from './NomenclatorItemForm'
import { CustomListItem } from '../../components/ui/lists/CustomListItem'
import { UserContext } from 'src/stores/contexts'
import { useSidebar } from 'src/hooks/useSidebar'
import { useListPagination } from 'src/hooks/useListPagination'
import ContainerWithSidebar from 'src/components/layout/container/GenericContainer'
import CommonButton from 'src/components/ui/buttons/CommonButton'
import { CommonIconButton } from 'src/components/ui/buttons/CommonIconButton'

export const NomenclatorItemList = () => {

    const { nomenclatorId } = useParams()
    const { selectedOrg } = useContext<UserContextItems>(UserContext)

    const [nomenclator, setNomenclator] = useState<NomenclatorDetailed | null>(null)

    const [nomenclatorItems, setNomenclatorItems] = useState<Paginable<NomenclatorItemDetailed> | null>(null)

    const [params, setParams] = useSearchParams()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<NomenclatorItemDetailed>("id", params, setParams, getNomenclatorItem, "DETAILS_NOM")

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(nomenclatorItems)

    useEffect(() => {
        getNomenclator(Number(nomenclatorId))
            .then(setNomenclator)
    }, [nomenclatorId])

    useEffect(() => {
        getNomenclatorItems({ only_active: false, detailed: true, page: fetchPage, page_size: pageSize, nomenclator_id: Number(nomenclatorId) })
            .then(setNomenclatorItems)
    }, [fetchPage, pageSize, selectedOrg, nomenclatorId])


    const updateEntityOnList = useCallback((entity: NomenclatorItemDetailed | null, mode: string) => {
        switch (mode) {
            case "CREATE_NOM": {
                getNomenclatorItems({ detailed: true, page_size: pageSize, only_active: false, page: nomenclatorItems?.page, nomenclator_id: Number(nomenclatorId) }).then(setNomenclatorItems)
                break;
            }
            case "UPDATE_NOM": {
                const newNom = entity as NomenclatorItemDetailed
                return setNomenclatorItems(prevList => {
                    if (!prevList || prevList.items.length === 0) return prevList
                    const nomenclatorItemsList = [...prevList.items]
                    const nomIdx = nomenclatorItemsList.findIndex(nom => nom.id === newNom.id)
                    if (nomIdx === -1) return prevList
                    nomenclatorItemsList[nomIdx] = newNom
                    return { ...prevList, items: [...nomenclatorItemsList] }
                })
            }
            case "DELETE_NOM": {
                if (selectedEntity && entity?.id === selectedEntity.id) closeSidebar()
                getNomenclatorItems({ detailed: true, page_size: pageSize, only_active: false, page: nomenclatorItems?.page, nomenclator_id: Number(nomenclatorId) }).then(setNomenclatorItems)
                break;
            }
        }
    }, [closeSidebar, nomenclatorId, nomenclatorItems?.page, pageSize, selectedEntity])

    const handleActive = useCallback((nom: NomenclatorItemDetailed) => {
        if (!nom) return
        const updateActive = (nom: NomenclatorItemDetailed) => {
            updateEntityOnList({ ...nom, active: !nom.active }, "UPDATE_NOM")
            if (selectedEntity?.id === nom.id) {
                handleSidebar("KEEP", { ...selectedEntity, active: !nom.active })
            }
        }
        const deleteWsp = (nom: NomenclatorItemDetailed) => {
            updateEntityOnList(nom, "DELETE_NOM")
            if (selectedEntity?.id === nom.id) {
                closeSidebar()
            }
        }
        if (nom.active) {
            disableNomenclatorItem(nom.id).then(res => {
                if (res.action === "disabled") updateActive(nom)
                if (res.action === "deleted") deleteWsp(nom)
            })
        } else {
            enableNomenclatorItem(nom.id).then(() => updateActive(nom))
        }
    }, [closeSidebar, handleSidebar, selectedEntity, updateEntityOnList])

    return (
        <ContainerWithSidebar isSidebarOpen={Boolean(sidebarMode)} sidebarComponent={
            <NomenclatorItemSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList} nomenclator={nomenclator}
                handleActive={handleActive} />
        }>
            <Stack spacing={3}>
                <Stack spacing={2} direction="row" useFlexGap sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                    <Typography variant="h1">Opciones de {nomenclator?.name}</Typography>
                    <ButtonGroup variant="outlined" sx={{ marginLeft: "auto" }} >
                        <CommonButton actionType='RETURN' variant='outlined' component={RouterLink} to="/nomenclators">Volver</CommonButton>
                        {nomenclatorItems && nomenclatorItems.items?.length > 0 &&
                            <CommonButton actionType="CREATE" onClick={() => { handleSidebar("CREATE_NOM", null) }}>
                                Crear Opciones
                            </CommonButton>
                        }
                    </ButtonGroup>
                </Stack>
                <Stack spacing={2}>
                    {
                        nomenclatorItems && nomenclatorItems.items?.length > 0 ?
                            <List>
                                {nomenclatorItems.items.map(nom =>
                                    <CustomListItem key={nom.id} disablePadding secondaryAction={
                                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                            <CommonIconButton actionType='DETAILS' title='Detalle' onClick={() => handleSidebar("DETAILS_NOM", nom)} tooltipSize='small' />
                                            {nom.organization_id &&
                                                <>
                                                    <CommonIconButton actionType='MODIFY' title='Modificar' onClick={() => handleSidebar("UPDATE_NOM", nom)} tooltipSize='small' />
                                                    <CommonIconButton actionType={nom.active ? "DISABLE" : "ENABLE"} tooltipSize="small"
                                                        title={nom.active ? "Deshabilitar" : "Habilitar"}
                                                        onClick={() => handleActive(nom)} color={nom.active ? "error" : "success"} />
                                                </>}
                                        </Stack>
                                    }>
                                        <ListItemButton onClick={() => handleSidebar("DETAILS_NOM", nom)} >
                                            <ListItemText primary={
                                                <Stack spacing={1} direction="row">
                                                    <Typography sx={{ fontWeight: "bold" }}>{nom.value}</Typography>
                                                </Stack>
                                            }
                                                secondary={!nom.organization_id && "(Opción del Sistema)"} />
                                        </ListItemButton>
                                    </CustomListItem>
                                )}
                            </List>
                            : <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
                                <Typography variant="h4">No se han encontrado opciones en este nomenclador...</Typography>
                                <CommonButton actionType='CREATE' onClick={() => { handleSidebar("CREATE_NOM", null) }} variant="contained">Crear Opción</CommonButton>
                            </Stack>
                    }
                    <PaginationComponent {...pageComponentProps} />
                </Stack>
            </Stack>
        </ContainerWithSidebar >
    )
}

interface SidebarProps {
    mode: string | null,
    entity: NomenclatorItemDetailed | null,
    nomenclator: NomenclatorDetailed | null,
    closeSidebar: () => void,
    updateEntityOnList: (
        entity: NomenclatorItemDetailed | null,
        mode: string,
    ) => void,
    handleSidebar: (mode: string, entity: NomenclatorItemDetailed | null) => void,
    handleActive: (entity: NomenclatorItemDetailed) => void
}
export const NomenclatorItemSidebar = memo(({ mode, entity, nomenclator, closeSidebar, updateEntityOnList, handleSidebar, handleActive }: SidebarProps) => {

    switch (mode) {

        case "CREATE_NOM":
            return <NomenclatorItemFormSidebar closeSidebar={closeSidebar} nomenclator={nomenclator}
                updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "UPDATE_NOM":
            return <NomenclatorItemFormSidebar existingNom={entity as NomenclatorItemDetailed} nomenclator={nomenclator}
                closeSidebar={closeSidebar} updateEntityOnList={entity => updateEntityOnList(entity, mode)}
                handleSidebar={handleSidebar} />
        case "DETAILS_NOM":
            return <NomenclatorItemDetails item={entity as NomenclatorItemDetailed} closeSidebar={closeSidebar}
                handleSidebar={handleSidebar} handleActive={handleActive} />
    }
})