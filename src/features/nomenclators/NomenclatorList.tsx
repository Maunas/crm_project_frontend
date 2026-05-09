import { memo, useCallback, useContext, useEffect, useState } from 'react'
import { NomenclatorFormSidebar } from './NomenclatorForm'
import { NomenclatorDetails } from './NomenclatorDetails'
import { CustomListItem } from 'src/components/ui/lists/CustomListItem'
import PaginationComponent from 'src/components/ui/lists/PaginationComponent'
import ContainerWithSidebar from 'src/components/layout/container/GenericContainer'
import CommonButton from 'src/components/ui/buttons/CommonButton'
import { CommonIconButton } from 'src/components/ui/buttons/CommonIconButton'
import { EnabledIcon } from 'src/components/ui/lists/Icons'
import { disableNomenclator, enableNomenclator, getNomenclator, getNomenclators } from './nomenclatorService'
import { useSidebar } from 'src/hooks/useSidebar'
import { useListPagination } from 'src/hooks/useListPagination'
import type { Paginable } from '../../types/shared'
import type { NomenclatorDetailed } from '../../types/nomenclators'
import type { UserContextItems } from 'src/stores/UserProvider'
import { UserContext } from 'src/stores/contexts'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const NomenclatorList = () => {

    const { activeOrg } = useContext<UserContextItems>(UserContext)

    const [nomenclators, setNomenclators] = useState<Paginable<NomenclatorDetailed> | null>(null)

    const [params, setParams] = useSearchParams()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<NomenclatorDetailed>("id", params, setParams, getNomenclator, "DETAILS_NOM")

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(nomenclators)

    useEffect(() => {
        getNomenclators({ only_active: false, detailed: true, page: fetchPage, page_size: pageSize })
            .then(setNomenclators)
    }, [fetchPage, pageSize, activeOrg])


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

    const handleActive = useCallback((nom: NomenclatorDetailed) => {
        if (!nom) return
        const updateActive = (nom: NomenclatorDetailed) => {
            updateEntityOnList({ ...nom, active: !nom.active }, "UPDATE_NOM")
            if (selectedEntity?.id === nom.id) {
                handleSidebar("KEEP", { ...selectedEntity, active: !nom.active })
            }
        }
        const deleteWsp = (nom: NomenclatorDetailed) => {
            updateEntityOnList(nom, "DELETE_NOM")
            if (selectedEntity?.id === nom.id) {
                closeSidebar()
            }
        }
        if (nom.active) {
            disableNomenclator(nom.id).then(res => {
                if (res.action === "disabled") updateActive(nom)
                if (res.action === "deleted") deleteWsp(nom)
            })
        } else {
            enableNomenclator(nom.id).then(() => updateActive(nom))
        }
    }, [closeSidebar, handleSidebar, selectedEntity, updateEntityOnList])

    return (
        <ContainerWithSidebar isSidebarOpen={Boolean(sidebarMode)} sidebarComponent={
            <NomenclatorSidebar mode={sidebarMode} entity={selectedEntity} handleSidebar={handleSidebar}
                closeSidebar={closeSidebar} updateEntityOnList={updateEntityOnList}
                handleActive={handleActive} />
        }>
            <Stack spacing={3}>
                <Stack direction="row" useFlexGap spacing={2} sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                    <Typography variant="h1">Lista de Nomencladores</Typography>
                    {nomenclators && nomenclators.items?.length > 0 &&
                        <CommonButton actionType="CREATE" onClick={() => { handleSidebar("CREATE_NOM", null) }}
                            sx={{ marginLeft: "auto" }} />
                    }
                </Stack>
                <Stack spacing={2}>
                    {
                        nomenclators && nomenclators.items?.length > 0 ?
                            <List>
                                {nomenclators.items.map(nom =>
                                    <CustomListItem key={nom.id} selected={nom.id === selectedEntity?.id} disablePadding secondaryAction={
                                        <Stack direction="row" sx={{ alignItems: "center" }}>
                                            <CommonIconButton actionType='DETAILS' title='Detalle' onClick={() => handleSidebar("DETAILS_NOM", nom)} tooltipSize='small' size="small" />
                                            <CommonIconButton actionType='LIST' title='Ver Items' component={RouterLink} to={`/nomenclators/${nom.id}`} tooltipSize='small' size="small" />
                                            {(nom.organization_id || activeOrg?.id === 0) &&
                                                <>
                                                    <CommonIconButton actionType='MODIFY' title='Modificar' onClick={() => handleSidebar("UPDATE_NOM", nom)} tooltipSize='small' size="small" />
                                                    <CommonIconButton actionType={nom.active ? "DISABLE" : "ENABLE"} tooltipSize="small" size="small"
                                                        title={nom.active ? "Deshabilitar" : "Habilitar"}
                                                        onClick={() => handleActive(nom)} color={nom.active ? "error" : "success"} />
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