/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react"
import type { LeadField, LeadFieldValue } from "../../types/leadFields"
import type { Lead } from "../../types/leads"
import { getLeadFields } from "../leadFields/leadFieldServices"
import { useNavigate } from "react-router-dom"
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"

interface LeadListTableProps {
    leads: Lead[],
    campaignId: number
}

export const LeadListTable = ({ leads, campaignId }: LeadListTableProps) => {

    const DEFAULT_N_OF_FIELDS = 8

    const [leadFields, setLeadFields] = useState<LeadField[]>([])

    useEffect(() => {
        if (!campaignId) return
        getLeadFields({ detailed: false, campaign_id: campaignId, only_active: true, page_size: 0 })
            .then(leadFields => {
                console.log(leadFields)
                setLeadFields(leadFields.items)
            })
    }, [campaignId])

    const [selectedIds, setSelectedIds] = useState<number[] | null>()

    useEffect(() => {
        if (!leadFields || leadFields.length === 0) return
        setSelectedIds(leadFields.slice(0, DEFAULT_N_OF_FIELDS).map(fields => fields.id))
    }, [campaignId, leadFields])

    const leadColumns = useMemo(() => {
        if (!leadFields || leadFields.length === 0) return null
        if (!selectedIds || selectedIds.length === 0) return null
        return leadFields.filter(leadField => selectedIds.includes(leadField.id))
    }, [leadFields, selectedIds])


    const getValue = (field_value: LeadFieldValue) => {
        if (field_value.value && field_value.value !== "") return `${field_value.value}`
        else if (field_value?.nomenclator_items?.length > 0) {
            return field_value.nomenclator_items?.reduce((acc, item) => `${acc}${acc.length > 0 ? " | " : ""}${item.value}`, "")
        }
        else if (field_value?.related_leads?.length > 0) {
            return field_value.related_leads?.reduce((acc, item) => {
                const relatedLeadName = item?.field_values?.[0]?.value + " " + item?.field_values?.[1]?.value
                return `${acc}${acc.length > 0 ? " | " : ""}${relatedLeadName}`
            }, "")
        }
        else return "---"
    }

    const nav = useNavigate()

    if (leads.length > 0 && leadColumns && leadColumns.length > 0) return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {leadColumns.map((column, idx) =>
                            <TableCell sx={{fontWeight: 600}} align={idx > 1 ? "right" : "left"} key={column.id}>{column.name}</TableCell>
                        )
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {leads.map(lead => (
                        <TableRow onClick={() => nav(`/leads/${lead.id}`)} className='selectable'
                            key={lead.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            {leadColumns.map((column, idx) => {
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
    )
}