import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { LeadFieldDetailed } from '../../types/leadFields'
import { getCampaign } from './campaignServices'
import { Button, Chip, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, ButtonGroup } from '@mui/material'
import type { Campaign } from '../../types/campaigns'
import { activeLeadField, deleteLeadField, getLeadFields } from '../leadFields/leadFieldServices'
import { GenericModal } from '../common/layout/GenericContainer'
import { SimulateLead } from '../lead/LeadForm'
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export const CampaignDetails = () => {
    const { id } = useParams()
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const [fields, setFields] = useState<LeadFieldDetailed[] | []>([])

    useEffect(() => {
        if (id) getCampaign(parseInt(id)).then((res) => {
            setCampaign(res)
            getLeadFields({ detailed: true, campaign_id: parseInt(id), only_active: false }).then(res => setFields(res))
        })
        return () => setCampaign(null)
    }, [id])

    const handleActive = (fieldIdx: number) => {
        const newFields = [...fields]
        if (fields[fieldIdx].active) {
            deleteLeadField(fields[fieldIdx].id)
                .then(() => {
                    newFields[fieldIdx].active = false
                    setFields(newFields)
                }).catch(() => alert("error"))
        } else {
            activeLeadField(fields[fieldIdx].id)
                .then(() => {
                    newFields[fieldIdx].active = true
                    setFields(newFields)
                }).catch(() => alert("error"))
        }
    }

    return (
        <Container>
            <Paper sx={{ padding: 2 }}>
                <Button component={Link} to="/campaigns" variant='outlined'>Volver</Button>

                {campaign &&
                    <>
                        <Typography variant="h1" color="initial">{campaign.name}</Typography>
                        <Typography color="initial">{campaign.description}</Typography>
                        <TableContainer>
                            <Typography variant="h2" color="initial">Campos de Lead</Typography>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell align="right">Tipo de Dato</TableCell>
                                        <TableCell align="right">Subtipo de Dato</TableCell>
                                        <TableCell align="right">Máscara</TableCell>
                                        <TableCell align="right">Plantilla/Nomenclador</TableCell>
                                        <TableCell align="right">Obligatorio</TableCell>
                                        <TableCell align="right">Único</TableCell>
                                        <TableCell align="right">Visible</TableCell>
                                        <TableCell align="right">Habilitado</TableCell>
                                        <TableCell align="right">Orden</TableCell>
                                        <TableCell align="right">Modificar</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fields?.sort((a, b) => a.order - b.order)
                                        .map((row, idx) => (
                                            <TableRow
                                                key={row.id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th">{row.id} - {row.name}</TableCell>
                                                <TableCell align="right">{row.field_type_code}</TableCell>
                                                <TableCell align="right">{row.field_subtype_code ?? "Sin subtipo"}</TableCell>
                                                <TableCell align="right">{row.input_mask || "Sin máscara"}</TableCell>
                                                <TableCell align="right">{row.field_template_code || row.nomenclator?.name || "Dato manual"}</TableCell>
                                                <TableCell align="right">{row.required ? <Chip color='success' label="Obligatorio" /> : <Chip color='error' label="Opcional" />}</TableCell>
                                                <TableCell align="right">{row.is_primary ? <Chip color='success' label="Único" /> : <Chip color='error' label="Repetible" />}</TableCell>
                                                <TableCell align="right">{row.is_visible ? <Chip color='success' label="Visible" /> : <Chip color='error' label="Oculto" />}</TableCell>
                                                <TableCell align="right">{row.active ? <Chip color='success' label="Habilitado" /> : <Chip color='error' label="Deshabilitado" />}</TableCell>
                                                <TableCell align="right">{row.order}</TableCell>
                                                <TableCell align="right">
                                                    <Button variant="text" component={Link} to={`/leadfield/modify/${row.id}`}>
                                                        <EditIcon />
                                                    </Button>
                                                    <Button variant="text" onClick={() => handleActive(idx)}>
                                                        {row.active ? <RemoveCircleOutlineIcon color="error" /> : <CheckCircleOutlineIcon color="success" />}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <ButtonGroup>
                            <Button component={Link} variant='contained' to={`/leadfield/new/${id}`}>
                                Agregar nuevo campo
                            </Button>
                            <GenericModal buttonText='Vista previa de formulario' buttonProps={{ variant: "outlined" }} containerSx={{ minWidth: "80vw" }} >
                                {campaign && fields?.length > 0 &&
                                    <SimulateLead campaignId={campaign.id} leadFields={fields} />
                                }
                            </GenericModal>
                        </ButtonGroup>
                    </>
                }
            </Paper>
        </Container>
    )
}
