import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { SimulateLeadFormModal } from "../lead/leadForm/LeadFormWraper"
import GenericModal from "shared/layout/container/GenericModal"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useModal } from "src/hooks/useModal"
import type { LeadFieldDetailed } from "src/types/leadFields"
import type { CampaignDetailed } from "src/types/campaigns"
import { disableLeadField, enableLeadField, getLeadField, getLeadFields, reorderLeadFields } from "./leadFieldServices"
import { ButtonGroup, Collapse, Paper, Stack, Table, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from "@mui/material"
import LoadingScreenWrapper from "src/components/feedback/LoadingScreen"
import { GenericSidebar } from "src/components/layout/container/GenericContainer"
import { DisableConfirmDialog } from "src/components/feedback/ConfirmationDialog"
import { useSearchParams } from "react-router-dom"
import { useLoading } from "src/hooks/useLoading"
import { useSidebar } from "src/hooks/useSidebar"
import { showCommonErrorToast, showToast } from "src/utils/feedback"
import { getFieldsBySections, getLeadFieldsBySectionsIds } from "./leadFieldUtils"
import { LeadFieldDetail } from "./LeadFieldDetail"
import { LeadFieldFormSidebar } from "./LeadFieldForm"
import { ValidationFormSidebar } from "../validations/ValidationForm"
import { LeadFieldTable } from "./LeadFieldTable"
import { CommonIconButton } from "src/components/ui/buttons/CommonIconButton"
import { useDragAndDrop } from "src/hooks/useDragAndDrop"

interface LeadFieldTableProps {
    campaign: CampaignDetailed,
    closeCmpSidebar: () => void,
    cmpSidebarMode: unknown | null
}

export interface ReorderFieldsIds {
    sectId: number;
    sectName: string;
    fields: number[];
}


const MIN_FIELDS = 10

export const LeadFieldList = memo(({ campaign, cmpSidebarMode, closeCmpSidebar }: LeadFieldTableProps) => {

    const { palette } = useTheme()

    const [leadFields, setLeadFields] = useState<LeadFieldDetailed[] | null>(null)

    const fetchLeadFields = useCallback((id: number) => {
        return getLeadFields({
            detailed: true, campaign_id: id, only_active: false, page_size: 0
        }).then(res => setLeadFields(res.items))
    }, [setLeadFields])

    const { loading: fieldsLoading, fnWithLoading: fetchFieldsLoad } = useLoading(fetchLeadFields)

    useEffect(() => {
        fetchFieldsLoad(Number(campaign.id))
    }, [campaign, fetchFieldsLoad])

    const [params, setParams] = useSearchParams()

    const { sidebarMode, selectedEntity, handleSidebar, closeSidebar } = useSidebar<LeadFieldDetailed>("id", params, setParams, getLeadField, "DETAILS_FIELD")

    const handleSidebarWrapper = useCallback((mode: string, entity?: LeadFieldDetailed | null) => {
        if (cmpSidebarMode) closeCmpSidebar()
        handleSidebar(mode, entity)
    }, [cmpSidebarMode, closeCmpSidebar, handleSidebar])

    //Define como actualizar la lista dependiendo de la acción realizada. 
    // Para CREATE se vuelve a hacer fetch de la página para no arruinar la paginación
    const updateEntity = useCallback((mode: string, entity: LeadFieldDetailed) => {
        switch (mode) {
            case "UPDATE_FIELD": {
                const newLeadField = entity as LeadFieldDetailed
                if (newLeadField.id === selectedEntity?.id) {
                    handleSidebar("KEEP", newLeadField)
                }
                return setLeadFields(prevList => {
                    if (!prevList || !(prevList?.length > 0)) return prevList
                    const newLeadFields = [...prevList]
                    const fieldIdx = prevList.findIndex(field => field.id === newLeadField.id)
                    if (fieldIdx === -1) return prevList
                    newLeadFields[fieldIdx] = newLeadField
                    return newLeadFields
                })
            }
            case "CREATE_FIELD": {
                return fetchFieldsLoad()
            }
            case "DELETE_FIELD": {
                return setLeadFields(prevList => {
                    if (!prevList || !(prevList?.length > 0)) return prevList
                    const newLeadFields = [...prevList]
                    const fieldIdx = prevList.findIndex(field => field.id === entity.id)
                    if (fieldIdx === -1) return prevList
                    newLeadFields.splice(fieldIdx, 1)
                    if (selectedEntity && entity.id === selectedEntity.id) closeSidebar()
                    return newLeadFields
                })
            }
        }
    }, [closeSidebar, selectedEntity, fetchFieldsLoad, handleSidebar])

    const handleActive = async (field: LeadFieldDetailed | null) => {
        if (!field || !field.id) return
        const updateActive = () => {
            updateEntity("UPDATE_FIELD", { ...field, active: !field.active })
            handleSidebar("KEEP", { ...field, active: !field.active })
        }
        if (field.active) {
            disableLeadField(field.id)
                .then(res => {
                    if (res.action === "disabled") {
                        updateActive()
                        showToast(`El campo "${field.name}" se ha deshabilitado con éxito`)
                    }
                    else {
                        updateEntity("DELETE_FIELD", field)
                        showToast(`El campo "${field.name}" se ha eliminado definitivamente`)
                    }
                })
                .catch(e => showCommonErrorToast(e))
        }
        else enableLeadField(field.id).then(() => {
            updateActive()
            showToast(`El campo "${field.name}" se ha habilitado con éxito`)
        })
            .catch(e => showCommonErrorToast(e))
    }

    const [deletingField, setDeletingField] = useState<LeadFieldDetailed | null>(null)
    const handleDeletingField = useCallback((deletingField: LeadFieldDetailed) => setDeletingField(deletingField), [])

    const [showAll, setShowAll] = useState<boolean>(false)

    const { modalProps } = useModal()

    const [openTableId, setOpenTableId] = useState<number | null>(null)

    const sortedFields = useMemo(() => {
        if (!leadFields || leadFields?.length === 0) return []
        return [...leadFields].sort((a, b) => a.order - b.order)
    }, [leadFields])

    const fieldsBySection = useMemo(() => {
        if (sortedFields.length === 0) return []
        return getFieldsBySections(sortedFields)
    }, [sortedFields])


    const [isReordering, setIsReordering] = useState<boolean>(false)
    const [fieldsBySectionIds, setFieldsBySectionIds] = useState<ReorderFieldsIds[]>([])

    useEffect(() => {
        setFieldsBySectionIds(getLeadFieldsBySectionsIds(fieldsBySection))
    }, [fieldsBySection])

    //Reordena las secciones, no los campos.
    const { dragEvents, dragStyles } = useDragAndDrop(fieldsBySectionIds, (i) => setFieldsBySectionIds(i))

    const submitReorder = useCallback((fieldsBySectionIds: ReorderFieldsIds[]) => {
        if (!campaign?.id) return
        const fieldsFlatList = fieldsBySectionIds.map(section => section.fields).flat()
        const reorder = fieldsFlatList.map((field, idx) => ({ field_id: field, order: idx + 1 }))
        reorderLeadFields({ campaign_id: campaign.id, orders: reorder })
            .then(res => {
                showToast(res.message)
                fetchFieldsLoad(campaign.id)
                setIsReordering(false)
            })
            .catch(e => showCommonErrorToast(e))
    }, [campaign, fetchFieldsLoad])

    const cancelReorder = () => {
        setFieldsBySectionIds(getLeadFieldsBySectionsIds(fieldsBySection))
        setIsReordering(false)
    }

    return (
        <Stack spacing={3}>
            <Stack useFlexGap direction="row" spacing={2}
                sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="h2">Lista de Campos de Lead</Typography>
                {sortedFields.length > 0 &&
                    <ButtonGroup sx={{ marginLeft: "auto" }}>
                        {!isReordering && <GenericModal {...modalProps} idModal="simulateLead" buttonText='Vista previa de formulario' maxWidth="xl" fullWidth
                            btnProps={{ actionType: "DETAILS", variant: "outlined" }} sx={{ minWidth: "80vw" }} >
                            {campaign &&
                                <SimulateLeadFormModal campaign={campaign} leadFields={sortedFields} onCancel={modalProps.handleClose} />
                            }
                        </GenericModal>}
                        {!isReordering && <CommonButton onClick={() => handleSidebar("CREATE_FIELD", null)} actionType="CREATE" onlyTooltip>
                            Agregar
                        </CommonButton>}
                        {isReordering && <CommonButton onClick={cancelReorder}
                            color="error" variant="outlined" actionType="CLOSE" onlyTooltip>
                            Cancelar
                        </CommonButton>}
                        <CommonButton onClick={() => isReordering ? submitReorder(fieldsBySectionIds) : setIsReordering(true)}
                            color={isReordering ? "primary" : "secondary"} variant={isReordering ? "contained" : "outlined"}
                            actionType={isReordering ? "SAVE" : "REORDER"} onlyTooltip>
                            Reordenar
                        </CommonButton>
                    </ButtonGroup>
                }
            </Stack>
            <LoadingScreenWrapper loading={fieldsLoading}>
                {fieldsBySectionIds.length > 0 ?
                    <Stack spacing={2}>
                        {fieldsBySectionIds.map((section, idx) => {
                            const sectFields = showAll ? section.fields : section.fields.slice(0, MIN_FIELDS)
                            const leadFieldsData = fieldsBySection.find(fbs => fbs.id === section.sectId)

                            const isOpen = openTableId === section.sectId

                            if (!leadFieldsData) return
                            return (
                                <TableContainer component={Paper} elevation={4} key={`section-${section.sectId}`}
                                    {...(isReordering ? dragEvents(idx) : {})} sx={isReordering ? dragStyles(idx, palette, "column") : {}} >
                                    <Table aria-label="simple table" size='small' >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell colSpan={6}>
                                                    <Typography variant="h3" sx={{ py: .5 }}>{section.sectName}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <CommonIconButton actionType={isOpen ? "CLOSE_LIST" : "OPEN_LIST"}
                                                        title={isOpen ? "Cerrar" : "Abrir"}
                                                        onClick={isOpen ? () => setOpenTableId(null) : () => setOpenTableId(section.sectId)} />
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                    </Table >
                                    <Collapse in={isOpen} >
                                        <LeadFieldTable sectLeadFields={leadFieldsData.fields} orderFieldsIds={sectFields}
                                            setOrderFieldsIds={setFieldsBySectionIds} sectIdx={idx} palette={palette} isReordering={isReordering}
                                            handleSidebar={handleSidebarWrapper} setDeletingField={handleDeletingField} />
                                        {sectFields.length > MIN_FIELDS &&
                                            <CommonButton actionType={showAll ? "MINUS" : "CREATE"} onClick={() => setShowAll(!showAll)} fullWidth>
                                                {showAll ? "Mostrar Menos" : "Mostrar Todos"}
                                            </CommonButton>}
                                    </Collapse >
                                </TableContainer>
                            )
                        })
                        }
                    </Stack>
                    :
                    <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
                        <Typography variant="h4">No se han encontrado campos para esta campaña...</Typography>
                        <CommonButton onClick={() => handleSidebar("CREATE_FIELD", null)} actionType="CREATE">Agregar</CommonButton>
                    </Stack>
                }
            </LoadingScreenWrapper>
            <GenericSidebar isSidebarOpen={Boolean(sidebarMode)} closeSidebar={closeSidebar} sidebarComponent={
                <LeadFieldSidebar mode={sidebarMode} entity={selectedEntity} updateEntity={updateEntity} campaign={campaign}
                    closeSidebar={closeSidebar} handleSidebar={handleSidebarWrapper} leadFieldListLength={leadFields?.length ?? 0} />
            } />
            <DisableConfirmDialog entity={deletingField} clearEntity={() => setDeletingField(null)} idModal='dis-field-det'
                onConfirm={() => handleActive(deletingField)} entityTypeName="el campo" />
        </Stack>
    )
})

interface SidebarProps {
    mode: string | null,
    entity: LeadFieldDetailed | null,
    closeSidebar: () => void,
    updateEntity: (mode: string, entity: LeadFieldDetailed) => void,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
    leadFieldListLength: number,
    campaign: CampaignDetailed
}

const LeadFieldSidebar = ({ mode, entity, handleSidebar, closeSidebar, updateEntity, campaign, leadFieldListLength }: SidebarProps) => {
    switch (mode) {
        case "DETAILS_FIELD":
            return <LeadFieldDetail leadField={entity as LeadFieldDetailed} leadFieldListLength={leadFieldListLength}
                closeSidebar={closeSidebar} handleSidebar={handleSidebar} updateEntity={updateEntity} />
        case "CREATE_FIELD":
            return <LeadFieldFormSidebar campaign={campaign} closeSidebar={closeSidebar} handleSidebar={handleSidebar}
                updateEntityOnList={(entity) => updateEntity(mode, entity)} />
        case "UPDATE_FIELD":
            return <LeadFieldFormSidebar existingLF={entity as LeadFieldDetailed} campaign={campaign}
                updateEntityOnList={(entity) => updateEntity(mode, entity)}
                closeSidebar={closeSidebar} handleSidebar={handleSidebar} />
        case "UPDATE_VAL":
            return <ValidationFormSidebar leadField={entity as LeadFieldDetailed}
                updateEntityOnList={(entity) => updateEntity("UPDATE_FIELD", entity)}
                handleSidebar={handleSidebar} />
    }
}