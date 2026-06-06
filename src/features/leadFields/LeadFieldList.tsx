import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { SimulateLeadFormModal } from "../lead/leadForm/LeadFormWraper"
import GenericModal from "shared/layout/container/GenericModal"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useModal } from "src/hooks/useModal"
import type { LeadFieldDetailed } from "src/types/leadFields"
import type { CampaignDetailed } from "src/types/campaigns"
import { disableBulkLeadField, disableLeadField, enableBulkLeadField, enableLeadField, getLeadField, getLeadFields, reorderLeadFields } from "./leadFieldServices"
import { Accordion, AccordionDetails, AccordionSummary, Box, ButtonGroup, Checkbox, Paper, Stack, TableContainer, Typography, useTheme } from "@mui/material"
import LoadingScreenWrapper from "src/components/feedback/LoadingScreen"
import { GenericSidebar } from "src/components/layout/container/GenericContainer"
import { DisableBulkConfirmDialog, DisableConfirmDialog } from "src/components/feedback/ConfirmationDialog"
import { useSearchParams } from "react-router-dom"
import { useLoading } from "src/hooks/useLoading"
import { useSidebar } from "src/hooks/useSidebar"
import { showCommonErrorToast, showToast } from "src/utils/feedback"
import { getFieldsBySections, getLeadFieldsBySectionsIds } from "./leadFieldUtils"
import { LeadFieldDetail } from "./LeadFieldDetail"
import { LeadFieldFormSidebar } from "./LeadFieldForm"
import { ValidationFormSidebar } from "../validations/ValidationForm"
import { LeadFieldTable } from "./LeadFieldTable"
import { useDragAndDrop } from "src/hooks/useDragAndDrop"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { stopPropagationEvent } from "src/utils/lists"
import { useSelectCheckbox } from "src/hooks/useSelectCheckbox"

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

    const [showAll, setShowAll] = useState<boolean>(false)

    const { modalProps } = useModal()

    const [openTableId, setOpenTableId] = useState<number | null>(null)

    const fieldsBySection = useMemo(() => {
        if (!leadFields || leadFields.length === 0) return []
        return getFieldsBySections(leadFields)
    }, [leadFields])

    const [isReordering, setIsReordering] = useState<boolean>(false)
    const [originalFieldsBySectionIds, setOriginalFieldsBySectionIds] = useState<ReorderFieldsIds[]>([])
    const [newFieldsBySectionIds, setNewFieldsBySectionIds] = useState<ReorderFieldsIds[]>([])

    useEffect(() => {
        setOriginalFieldsBySectionIds(getLeadFieldsBySectionsIds(fieldsBySection))
        setNewFieldsBySectionIds(getLeadFieldsBySectionsIds(fieldsBySection))
    }, [fieldsBySection])

    //Reordena las secciones, no los campos.
    const { handleDragEnter, handleDragOver, handleDragStart, handleDrop, dragStyles } = useDragAndDrop(newFieldsBySectionIds, (i) => setNewFieldsBySectionIds(i))

    const submitReorder = useCallback((updatedfieldsBySectionIds: ReorderFieldsIds[]) => {
        if (!campaign?.id) return
        if (JSON.stringify(updatedfieldsBySectionIds) === JSON.stringify(originalFieldsBySectionIds)) return setIsReordering(false)
        const fieldsFlatList = updatedfieldsBySectionIds.map(section => section.fields).flat()
        const reorder = fieldsFlatList.map((field, idx) => ({ field_id: field, order: idx + 1 }))
        reorderLeadFields({ campaign_id: campaign.id, orders: reorder })
            .then(res => {
                showToast(res.message)
                fetchFieldsLoad(campaign.id)
                setIsReordering(false)
            })
            .catch(e => showCommonErrorToast(e))
    }, [campaign, fetchFieldsLoad, originalFieldsBySectionIds])

    const cancelReorder = () => {
        setNewFieldsBySectionIds(originalFieldsBySectionIds)
        setIsReordering(false)
    }


    // Deshabilitación de campos
    const [deletingField, setDeletingField] = useState<LeadFieldDetailed | null>(null)
    const handleDeletingField = useCallback((deletingField: LeadFieldDetailed) => setDeletingField(deletingField), [])

    const { checkedItems, checkedItemsArray, addItem, removeItem, removeAllItems, areThereActiveItems, areThereInactiveItems } = useSelectCheckbox<LeadFieldDetailed>()

    /**Devuelve la cantidad de items seleccionados por sección */
    const checkedBySectionId = useMemo(() => {
        const map = new Map<number, number>()
        for (const item of checkedItemsArray) {
            const sectId = item.lead_field_section.id
            map.set(sectId, (map.get(sectId) ?? 0) + 1)
        }
        return map
    }, [checkedItemsArray])

    const [bulkDisabling, setBulkDisabling] = useState<"disable" | "enable" | null>(null)

    const handleActiveBulk = useCallback((isDisabling: boolean) => {
        if (isDisabling) {
            return disableBulkLeadField(checkedItemsArray.map(i => i.id))
                .then(res => {
                    removeAllItems()
                    const [disLength, delLength, failLength] = [res.disabled.length, res.deleted.length, res.failed.length]
                    if (delLength + disLength > 0) fetchFieldsLoad(campaign.id)
                    showToast(`
                        ${disLength > 0 ? `Se han deshabilitado ${disLength} campo${disLength > 1 ? "s" : ""}. ` : ""}
                        ${delLength > 0 ? `Se han eliminado definitivamente ${delLength} campo${delLength > 1 ? "s" : ""}. ` : ""}
                        ${failLength > 0 ? `No se ha podido deshabilitar ${failLength} campo${failLength > 1 ? "s" : ""}.` : ""}
                        `)
                })
                .catch(e => showCommonErrorToast(e))
        }
        return enableBulkLeadField(checkedItemsArray.map(i => i.id))
            .then(res => {
                removeAllItems()
                const [enLength, failLength] = [res.activated.length, res.failed.length]
                if (enLength > 0) fetchFieldsLoad(campaign.id)
                showToast(`
                        ${enLength > 0 ? `Se han habilitado ${enLength} campo${enLength > 1 ? "s" : ""}. ` : ""}
                        ${failLength > 0 ? `No se ha podido habilitar ${failLength} campo${failLength > 1 ? "s" : ""}.` : ""}
                        `)
            })
            .catch(e => showCommonErrorToast(e))
    }, [campaign.id, checkedItemsArray, fetchFieldsLoad, removeAllItems])

    return (
        <Stack spacing={3}>
            <Stack useFlexGap direction="row" spacing={2}
                sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="h2">Lista de Campos de Lead</Typography>
                {leadFields && leadFields.length > 0 &&
                    <ButtonGroup sx={{ marginLeft: "auto" }}>
                        {!isReordering && <GenericModal {...modalProps} idModal="simulateLead" buttonText='Vista previa de formulario' maxWidth="xl" fullWidth
                            btnProps={{ actionType: "DETAILS", variant: "outlined" }} sx={{ minWidth: "80vw" }} >
                            {campaign &&
                                <SimulateLeadFormModal campaign={campaign} leadFields={leadFields} onCancel={modalProps.handleClose} />
                            }
                        </GenericModal>}
                        {!isReordering && checkedItemsArray.length > 0 && areThereInactiveItems &&
                            <CommonButton onClick={() => setBulkDisabling("enable")} actionType="ENABLE" color="success" variant="outlined" onlyTooltip>
                                Habilitar Seleccionados
                            </CommonButton>}
                        {!isReordering && checkedItemsArray.length > 0 && areThereActiveItems &&
                            <CommonButton onClick={() => setBulkDisabling("disable")} actionType="DISABLE" color="error" variant="outlined" onlyTooltip>
                                Deshabilitar Seleccionados
                            </CommonButton>}
                        {isReordering && <CommonButton onClick={cancelReorder}
                            color="error" variant="outlined" actionType="CLOSE" onlyTooltip>
                            Cancelar
                        </CommonButton>}
                        <CommonButton onClick={() => isReordering ? submitReorder(newFieldsBySectionIds) : setIsReordering(true)}
                            color={isReordering ? "primary" : "secondary"} variant={isReordering ? "contained" : "outlined"}
                            actionType={isReordering ? "SAVE" : "REORDER"} onlyTooltip>
                            Reordenar
                        </CommonButton>
                        {!isReordering && <CommonButton onClick={() => handleSidebar("CREATE_FIELD", null)} actionType="CREATE" onlyTooltip>
                            Agregar
                        </CommonButton>}

                    </ButtonGroup>
                }
            </Stack>
            <LoadingScreenWrapper loading={fieldsLoading}>
                {newFieldsBySectionIds.length > 0 ?
                    <Box>
                        {newFieldsBySectionIds.map((section, idx) => {
                            const sectFields = showAll ? section.fields : section.fields.slice(0, MIN_FIELDS)
                            const leadFieldsData = fieldsBySection.find(fbs => fbs.id === section.sectId)
                            const sectionCheckedItems = checkedBySectionId.get(section.sectId) ?? 0
                            if (!leadFieldsData) return
                            return (
                                <Accordion expanded={openTableId === section.sectId} elevation={2} key={`${section.sectId}-acc`}
                                    onChange={(_, expanded) => expanded ? setOpenTableId(section.sectId) : setOpenTableId(null)}
                                    sx={isReordering ? dragStyles(idx, palette, "column", true) : {}}
                                    {...(isReordering ? {
                                        onDragEnter: () => handleDragEnter(idx),
                                        onDragOver: handleDragOver,
                                        onDrop: () => handleDrop(idx)
                                    } : {})}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${section.sectId}-content`} id={`${section.sectId}-header`}>
                                        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                                            {!isReordering ?
                                                <Checkbox
                                                    checked={section.fields.length === sectionCheckedItems}
                                                    indeterminate={sectionCheckedItems > 0 && section.fields.length !== sectionCheckedItems}
                                                    onClick={stopPropagationEvent()}
                                                    onChange={(_, checked) => checked ? addItem(leadFieldsData.fields) : removeItem(leadFieldsData.fields)} /> :
                                                <CommonButton actionType="DRAG" draggable variant="contained" onlyTooltip color="primary"
                                                    onClick={stopPropagationEvent()}
                                                    onDragStart={() => handleDragStart(idx)} sx={{ cursor: "grab", px: 1.5, minWidth: 0 }} />
                                            }
                                            <Typography variant="h3" sx={{ py: .5, flexGrow: 1 }}>{section.sectName}</Typography>
                                            {sectionCheckedItems > 0 &&
                                                <Typography variant="body1" sx={{ fontStyle: "italic", py: .5, flexGrow: 1 }}>
                                                    {`- ${sectionCheckedItems === 1 ? "1 item seleccionado" : `${sectionCheckedItems} items seleccionados`} `}
                                                </Typography>
                                            }
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <TableContainer component={Paper} elevation={4} key={`section-${section.sectId}`}>
                                            <LeadFieldTable sectLeadFields={leadFieldsData.fields} orderFieldsIds={sectFields}
                                                setOrderFieldsIds={setNewFieldsBySectionIds} sectIdx={idx} palette={palette} isReordering={isReordering}
                                                handleSidebar={handleSidebarWrapper} setDeletingField={handleDeletingField} checkedItems={checkedItems}
                                                addItem={addItem} removeItem={removeItem} />
                                            {sectFields.length > MIN_FIELDS &&
                                                <CommonButton actionType={showAll ? "MINUS" : "CREATE"} onClick={() => setShowAll(!showAll)} fullWidth>
                                                    {showAll ? "Mostrar Menos" : "Mostrar Todos"}
                                                </CommonButton>}
                                        </TableContainer>
                                    </AccordionDetails>
                                </Accordion>
                            )
                        })
                        }
                    </Box>
                    :
                    <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
                        <Typography variant="h4">No se han encontrado campos para esta campaña...</Typography>
                        <CommonButton onClick={() => handleSidebar("CREATE_FIELD", null)} actionType="CREATE">Agregar</CommonButton>
                    </Stack>
                }
            </LoadingScreenWrapper >
            <GenericSidebar isSidebarOpen={Boolean(sidebarMode)} closeSidebar={closeSidebar} sidebarComponent={
                <LeadFieldSidebar mode={sidebarMode} entity={selectedEntity} updateEntity={updateEntity} campaign={campaign}
                    closeSidebar={closeSidebar} handleSidebar={handleSidebarWrapper} leadFields={leadFields} />
            } />
            <DisableConfirmDialog entity={deletingField} clearEntity={() => setDeletingField(null)} idModal='dis-field-det'
                onConfirm={() => handleActive(deletingField)} entityTypeName="el campo" />
            <DisableBulkConfirmDialog idModal="dis-field-bulk" isDisabling={bulkDisabling === "disable"} open={Boolean(bulkDisabling)}
                onClose={() => setBulkDisabling(null)}
                onConfirm={() => handleActiveBulk(bulkDisabling === "disable")} entityTypeName="los campos seleccionados" />
        </Stack >
    )
})

interface SidebarProps {
    mode: string | null,
    entity: LeadFieldDetailed | null,
    closeSidebar: () => void,
    updateEntity: (mode: string, entity: LeadFieldDetailed) => void,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
    leadFields: LeadFieldDetailed[] | null,
    campaign: CampaignDetailed
}

const LeadFieldSidebar = ({ mode, entity, handleSidebar, closeSidebar, updateEntity, campaign, leadFields }: SidebarProps) => {
    switch (mode) {
        case "DETAILS_FIELD":
            return <LeadFieldDetail leadField={entity as LeadFieldDetailed} leadFieldListLength={leadFields?.length ?? 0}
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