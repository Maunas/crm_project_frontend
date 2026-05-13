import { memo, useCallback, useContext, useEffect, useState } from 'react'
import { NomenclatorItemFormSidebar } from './NomenclatorItemForm'
import { NomenclatorItemDetails } from './NomenclatorItemDetails'
import ContainerWithSidebar from 'shared/layout/container/GenericContainer'
import { CommonIconButton } from 'shared/ui/buttons/CommonIconButton'
import PaginationComponent from 'shared/ui/lists/PaginationComponent'
import { CustomListItem } from 'shared/ui/lists/CustomListItem'
import CommonButton from 'shared/ui/buttons/CommonButton'
import { EnabledIcon } from 'shared/ui/lists/Icons'
import { disableNomenclatorItem, enableNomenclatorItem, getNomenclator, getNomenclatorItem, getNomenclatorItems } from './nomenclatorService'
import { useListPagination } from 'src/hooks/useListPagination'
import { useSidebar } from 'src/hooks/useSidebar'
import type { NomenclatorDetailed, NomenclatorItemDetailed } from 'src/types/nomenclators'
import type { Paginable } from 'src/types/shared'
import { UserContext } from 'src/stores/contexts'
import type { UserContextItems } from 'src/stores/UserProvider'
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom'
import { Breadcrumbs, ButtonGroup, Link, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const NomenclatorItemList = () => {

    const { nomenclatorId } = useParams()

    const { activeOrg } = useContext<UserContextItems>(UserContext)

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
    }, [fetchPage, pageSize, activeOrg, nomenclatorId])


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
        <ContainerWithSidebar isSidebarOpen={Boolean(sidebarMode)} closeSidebar={closeSidebar} sidebarComponent={
            <NomenclatorItemSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList} nomenclator={nomenclator}
                handleActive={handleActive} />
        }>
            <Stack spacing={2}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link component={RouterLink} to={`/nomenclators?selected=${nomenclator?.id}`} underline="hover" color="inherit">
                        Nomencladores
                    </Link>
                    {nomenclator &&
                        <Typography sx={{ color: 'text.primary' }}>{nomenclator.name}</Typography>}
                </Breadcrumbs>
                <Stack spacing={3}>
                    <Stack spacing={1} direction="row" useFlexGap sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                        <Typography variant="h1">Opciones de {nomenclator?.name}</Typography>
                        <ButtonGroup variant="outlined" sx={{ marginLeft: "auto" }} >
                            {nomenclatorItems && nomenclatorItems.items?.length > 0 &&
                                <CommonButton actionType="CREATE" onClick={() => { handleSidebar("CREATE_NOM", null) }} onlyTooltip>
                                    Agregar
                                </CommonButton>
                            }
                        </ButtonGroup>
                    </Stack>
                    <Stack spacing={2}>
                        {
                            nomenclatorItems && nomenclatorItems.items?.length > 0 ?
                                <List>
                                    {nomenclatorItems.items.map(nom =>
                                        <CustomListItem key={nom.id} selected={nom.id === selectedEntity?.id} disablePadding secondaryAction={
                                            <Stack direction="row" sx={{ alignItems: "center" }}>
                                                <CommonIconButton actionType='DETAILS' title='Detalle' onClick={() => handleSidebar("DETAILS_NOM", nom)} tooltipSize='small' size='small' />
                                                {(nom.organization_id || activeOrg?.id === 0) &&
                                                    <>
                                                        <CommonIconButton actionType='MODIFY' title='Modificar' onClick={() => handleSidebar("UPDATE_NOM", nom)} tooltipSize='small' size='small' />
                                                        <CommonIconButton actionType={nom.active ? "DISABLE" : "ENABLE"} tooltipSize="small" size='small'
                                                            title={nom.active ? "Deshabilitar" : "Habilitar"}
                                                            onClick={() => handleActive(nom)} color={nom.active ? "error" : "success"} />
                                                    </>}
                                            </Stack>
                                        }>
                                            <ListItemButton onClick={() => handleSidebar("DETAILS_NOM", nom)} >
                                                <ListItemText sx={{ mr: 7 }} primary={
                                                    <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
                                                        <EnabledIcon active={nom.active} />
                                                        <Typography sx={{ fontWeight: "bold" }}>{nom.value}</Typography>
                                                        {nom.parent_item &&
                                                            <>
                                                                <ArrowBackIcon />
                                                                <Typography variant="subtitle2">
                                                                    {nom.parent_item.value}
                                                                </Typography>
                                                            </>
                                                        }
                                                    </Stack>
                                                }
                                                    secondary={!nom.organization_id && <span style={{ fontStyle: "italic" }}>
                                                        Opción del Sistema
                                                    </span>} />
                                            </ListItemButton>
                                        </CustomListItem>
                                    )}
                                </List>
                                : <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
                                    <Typography variant="h4">No se han encontrado opciones en este nomenclador...</Typography>
                                    <CommonButton actionType='CREATE' onClick={() => { handleSidebar("CREATE_NOM", null) }} variant="contained">Agregar</CommonButton>
                                </Stack>
                        }
                        <PaginationComponent {...pageComponentProps} />
                    </Stack>
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