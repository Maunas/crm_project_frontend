/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react"
import { GenericModal } from "../common/layout/GenericContainer"
import LeadColumnSelector from "./LeadColumnSelector"
import type { LeadField, LeadFieldValue } from "../../types/leadFields"
import type { Lead } from "../../types/leads"
import { useDragAndDrop } from "../hooks/useDragAndDrop"
import { getLeadFields } from "../leadFields/leadFieldServices"
import { useNavigate } from "react-router-dom"
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"

interface LeadListTableProps {
    leads: Lead[],
    campaignId: number,
    modalProps: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
        handleClose: () => void;
    }
}

export const LeadListTable = ({ leads, campaignId, modalProps }: LeadListTableProps) => {

    const DEFAULT_N_OF_FIELDS = 6
    const nav = useNavigate()

    const [leadFields, setLeadFields] = useState<LeadField[]>([])

    useEffect(() => {
        if (!campaignId) return
        getLeadFields({ detailed: false, campaign_id: campaignId, only_active: true, page_size: 0 })
            .then(leadFields => setLeadFields(leadFields.items))
    }, [campaignId])

    const [selectedIds, setSelectedIds] = useState<number[]>([])

    //Trae el arreglo de ids, con el orden definido de leads en localStorage. Si no, trae los primeros N elementos
    useEffect(() => {
        if (!leadFields || leadFields.length === 0) return
        const localSelectedFields = JSON.parse(window.localStorage.getItem("sel_lead_fields") ?? "{}")?.[campaignId]
        if (localSelectedFields) {
            setSelectedIds(localSelectedFields)
        } else {
            setSelectedIds(leadFields.slice(0, DEFAULT_N_OF_FIELDS).map(fields => fields.id))
        }
    }, [leadFields])

    //Filtra los objetos LeadField para seguir el orden del arreglo de ids.
    const selectedColumns = useMemo(() => {
        if (!leadFields || leadFields.length === 0) return null
        if (!selectedIds || selectedIds.length === 0) return null
        return leadFields.filter(leadField => selectedIds.includes(leadField.id))
            .sort((a, b) => selectedIds.indexOf(a.id) - selectedIds.indexOf(b.id))
    }, [leadFields, selectedIds])

    //Ante cambios a selectedIds los actualiza en localStorage
    useEffect(() => {
        if (selectedIds.length === 0) return
        const totalSelectedFields = window.localStorage.getItem("sel_lead_fields")
        let newTotalSelectedFields: Record<number, number[]> = {}
        if (totalSelectedFields) {
            newTotalSelectedFields = { ...JSON.parse(totalSelectedFields) }
        }
        newTotalSelectedFields[campaignId] = selectedIds
        window.localStorage.setItem("sel_lead_fields", JSON.stringify(newTotalSelectedFields))
    }, [selectedIds])

    const getValue = (field_value: LeadFieldValue) => {
        if (field_value.value && field_value.value !== "") return `${field_value.value}`
        else if (field_value?.nomenclator_items?.length > 0) {
            return field_value.nomenclator_items?.reduce((acc, item) =>
                `${acc}${acc.length > 0 ? " | " : ""}${item.value}`
                , "")
        }
        else if (field_value?.related_leads?.length > 0) {
            return field_value.related_leads?.reduce((acc, item) =>
                `${acc}${acc.length > 0 ? " | " : ""}${item?.field_values?.[0]?.value}`
                , "")
        }
        else return "---"
    }

    const handleSelectedIds = (ids: number[]) => {
        setSelectedIds(ids)
        modalProps.handleClose()
    }

    const { dragStyles, dragEvents } = useDragAndDrop(selectedIds, (items) => setSelectedIds(items))

    if (leads.length > 0 && selectedColumns && selectedColumns.length > 0) return (
        <>
            <GenericModal idModal="columns_selector" modalProps={modalProps} buttonText="Modificar Columnas" maxWidth="md" showButton={false}>
                <LeadColumnSelector itemsList={leadFields} selectedIds={selectedIds!} handleSelectedIds={handleSelectedIds} handleClose={modalProps.handleClose} showField="name" />
            </GenericModal>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {selectedColumns.map((column, idx) =>
                                <TableCell align={idx > 1 ? "right" : "left"} key={column.id}
                                    {...dragEvents(idx, false)}
                                    sx={{
                                        fontWeight: 600,
                                        ...dragStyles(idx, "row")
                                    }}
                                >
                                    {column.name}
                                </TableCell>
                            )
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leads.map(lead => (
                            <TableRow onClick={() => nav(`/leads/${lead.id}`)} className='selectable'
                                key={lead.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                {selectedColumns.map((column, idx) => {
                                    const leadValue = lead.field_values.find(lv => lv.field_id === column.id)
                                    //Si no se encuentra, no hay valor
                                    if (!leadValue) return <TableCell component="td" scope="row" align={idx === 0 ? "left" : "right"} key={`${lead.id}-${column.id}`}>---</TableCell>
                                    //Si es el primer elemento, nombre completo
                                    else return (
                                        <TableCell component="td" scope="row" align={idx > 1 ? "right" : "left"} key={`${lead.id}-${column.id}`}>{getValue(leadValue)}</TableCell>
                                    )
                                })
                                }
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}