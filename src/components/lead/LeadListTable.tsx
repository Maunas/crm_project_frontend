/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react"
import { GenericModal } from "../common/layout/GenericContainer"
import LeadColumnSelector from "./LeadColumnSelector"
import type { LeadField, LeadFieldValue } from "../../types/leadFields"
import type { Lead } from "../../types/leads"
import { useDragAndDrop } from "../hooks/useDragAndDrop"
import { getLeadFields } from "../leadFields/leadFieldServices"
import { Link, useNavigate } from "react-router-dom"
import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme, ButtonGroup, Badge, IconButton } from "@mui/material"
import { alpha, lighten } from "@mui/material/styles"
import { CommonButton } from "../common/details/DetailsCommonButton"
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useOrderList } from "../hooks/useOrderList"

interface LeadListTableProps {
    leads: Lead[],
    campaignId: number,
    modalProps: {
        open: string | number | boolean;
        handleOpen: (idModal: string | number) => void;
        handleClose: () => void;
    },
    activeFilters: number,
    orderList: (
        fieldId: number | string | null,
        ascending: boolean
    ) => void,
}

export const LeadListTable = ({ leads, campaignId, activeFilters = 0, orderList, modalProps }: LeadListTableProps) => {

    const DEFAULT_N_OF_FIELDS = 6
    const nav = useNavigate()
    const { palette } = useTheme()

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

    const { orderBy, ascending, handleOrderList } = useOrderList(orderList)

    //Si hay leads, pero no hay columnas seleccionadas
    if (selectedColumns?.length === 0 && leads.length > 0) return (
        <Stack gap={3} my={3} alignItems="center">
            <GenericModal idModal="columns_selector" modalProps={modalProps} buttonText="Modificar Columnas" maxWidth="md" showButton={false}>
                <LeadColumnSelector itemsList={leadFields} selectedIds={selectedIds!} handleSelectedIds={handleSelectedIds} handleClose={modalProps.handleClose} showField="name" />
            </GenericModal>
            <Stack gap={2} alignItems="center">
                <Typography variant="h3">No hay leads para presentar.</Typography>
                <Typography variant="h4">Revisa las columnas seleccionadas.</Typography>
            </Stack>
            <CommonButton actionType="OPTIONS" color="secondary" onClick={() => modalProps.handleOpen("columns_selector")}>
                Modificar Columnas
            </CommonButton>
        </Stack>
    )

    if (leads.length === 0) return (
        <Stack gap={3} my={3} alignItems="center">
            <Stack gap={2} alignItems="center">
                <Typography variant="h3">No hay leads para presentar.</Typography>
                <Typography variant="h4">Agrega un lead nuevo
                    {activeFilters > 0 && " o revisa los filtros activos."}
                </Typography>
            </Stack>
            <ButtonGroup >
                <CommonButton actionType="CREATE" color="primary" component={Link} to="/leads/new">
                    Agregar Lead
                </CommonButton>
                {activeFilters > 0 &&
                    <Badge badgeContent={activeFilters} color="success">
                        <CommonButton actionType="FILTER" color="secondary" onClick={() => modalProps.handleOpen("lead_filters")}>
                            Aplicar Filtros
                        </CommonButton>
                    </Badge>
                }
            </ButtonGroup>
        </Stack>
    )

    if (leads.length > 0) return (
        <>
            <GenericModal idModal="columns_selector" modalProps={modalProps} buttonText="Modificar Columnas" maxWidth="md" showButton={false}>
                <LeadColumnSelector itemsList={leadFields} selectedIds={selectedIds!} handleSelectedIds={handleSelectedIds} handleClose={modalProps.handleClose} showField="name" />
            </GenericModal>
            {selectedColumns && selectedColumns.length > 0 &&
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650, backgroundColor: lighten(palette.background.paper, .1) }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {selectedColumns.map((column, idx) =>
                                    <TableCell align="left" key={column.id}
                                        {...dragEvents(idx, false)}
                                        sx={{
                                            fontWeight: 600,
                                            ...dragStyles(idx, "row")
                                        }}
                                    >
                                        {column.name}
                                        <IconButton size="small" onClick={() => handleOrderList(column.id)}
                                            sx={{
                                                backgroundColor: orderBy === column.id ? alpha(palette.secondary.light, .7) : "none",
                                                color: orderBy === column.id ? palette.secondary.contrastText : palette.text.primary,
                                                marginInlineStart: ".5rem",
                                                "&:hover": {
                                                    backgroundColor: palette.secondary.main,
                                                    color: palette.secondary.contrastText
                                                }
                                            }}
                                        >
                                            {orderBy !== column.id &&
                                                <ArrowUpwardIcon />
                                            }
                                            {orderBy === column.id &&

                                                (ascending ?
                                                    <ArrowUpwardIcon />
                                                    :
                                                    <ArrowDownwardIcon />
                                                )
                                            }
                                        </IconButton>
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
                                    {selectedColumns.map((column) => {
                                        const leadValue = lead.field_values.find(lv => lv.field_id === column.id)
                                        //Si no se encuentra, no hay valor
                                        if (!leadValue) return <TableCell component="td" scope="row" align="left" key={`${lead.id}-${column.id}`}>---</TableCell>
                                        //Si es el primer elemento, nombre completo
                                        else return (
                                            <TableCell component="td" scope="row" align="left" key={`${lead.id}-${column.id}`}>{getValue(leadValue)}</TableCell>
                                        )
                                    })
                                    }
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            }
        </>
    )
}