import { CommonButton, DisableButton } from '../common/details/DetailsCommonButton';
import type { LeadFieldDetailed } from '../../types/leadFields'
import type { CampaignDetailed } from '../../types/campaigns';
import { disableLeadField, enableLeadField } from './leadFieldServices';
import { Link as RouterLink } from 'react-router-dom'
import dayjs from 'dayjs'
import { Grid, Stack, Typography, Divider, Link, ButtonGroup, Box } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ValidationList } from '../validations/ValidationList';
import { CustomChip } from '../common/details/StyledDisplayComponents';
import { alpha, useTheme } from '@mui/material/styles';

interface LeadFieldDetailProps {
    leadField: LeadFieldDetailed,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
    updateEntity: (mode: string, entity: CampaignDetailed | LeadFieldDetailed) => void,
    closeSidebar: () => void,
}

export const LeadFieldDetail = ({ leadField, updateEntity, handleSidebar, closeSidebar }: LeadFieldDetailProps) => {

    const handleActive = (field: LeadFieldDetailed) => {
        const updateActive = () => {
            updateEntity("UPDATE_FIELD", { ...field, active: !field.active })
            handleSidebar("KEEP", { ...field, active: !field.active })
        }
        if (field.active) {
            disableLeadField(field.id)
                .then(res => {
                    if (res.action === "disabled") updateActive()
                    else {
                        updateEntity("DELETE_FIELD", leadField)
                        closeSidebar()
                    }
                })
        }
        else enableLeadField(field.id).then(updateActive)
    }

    const { palette } = useTheme()

    return (
        <Stack gap={3} >
            <Grid container gap={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h2">
                    {leadField.order} - {leadField.name}
                </Typography>
                {leadField.active ? <CustomChip color='success' label="Habilitado" /> :
                    <CustomChip color='error' label="Deshabilitado" />}
            </Grid>
            <Stack gap={2} >
                <Grid container gap={1} size="grow" minWidth="20rem">
                    <Grid size="grow" minWidth="10rem">
                        <Typography variant="body1" fontWeight="bold">Seccion:</Typography>
                        <Typography variant="body1" paddingInlineStart={2} >
                            {leadField.lead_field_section.name}
                        </Typography>
                    </Grid>
                    <Grid size="grow" minWidth="10rem">
                        <Typography variant="body1" fontWeight="bold">Modo de Creación:</Typography>
                        <Typography variant="body1" paddingInlineStart={2}>
                            {leadField.field_template_name && <span style={{ fontWeight: "bold" }}>Plantilla: </span>}
                            {leadField.field_template_name ? `${leadField.field_template_name}` : "Creación Manual"}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container gap={1} size="grow" justifyContent="center">
                    {leadField.required ? <CustomChip color='success' label="Obligatorio" size="small" sx={{ fontWeight: "bold" }} /> :
                        <CustomChip color='error' label="Opcional" size="small" sx={{ fontWeight: "bold" }} />}
                    {leadField.is_primary ? <CustomChip color='success' label="Único" size="small" sx={{ fontWeight: "bold" }} /> :
                        <CustomChip color='error' label="Repetible" size="small" sx={{ fontWeight: "bold" }} />}
                    {leadField.is_visible ? <CustomChip color='success' label="Visible" size="small" sx={{ fontWeight: "bold" }} /> :
                        <CustomChip color='error' label="Oculto" size="small" sx={{ fontWeight: "bold" }} />}
                </Grid>
                <Divider />
                <Stack gap={2}>
                    <Typography variant="h3" fontWeight="bold">Tipo {leadField.field_subtype?.description ? `/ Subtipo` : ""} de dato</Typography>
                    <Grid container gap={1} alignItems="center" justifyContent="center">
                        <CustomChip color='primary' label={leadField.field_type.description} size="xlarge" sx={{ fontWeight: "bold" }} />
                        {leadField.field_subtype?.description &&
                            <>
                                <ArrowForwardIcon />
                                <CustomChip color='info' label={leadField.field_subtype?.description} size="large" sx={{ fontWeight: "bold" }} />
                            </>
                        }
                    </Grid>
                    {(leadField?.nomenclator || leadField?.related_campaign || leadField?.calculation_expression) &&
                        <Stack gap={1} alignItems="start">
                            {leadField?.nomenclator &&
                                <>
                                    <Typography variant="body1" fontWeight="bold">Selector:</Typography>
                                    <Box width="100%" bgcolor={alpha(palette.background.default, .5)}
                                        textAlign="center" px={2} py={1} borderRadius={3}>
                                        <Typography variant="body1">
                                            {leadField?.nomenclator.name}
                                        </Typography>
                                    </Box>
                                </>
                            }
                            {leadField?.related_campaign &&
                                <>
                                    <Typography variant="body1" fontWeight="bold">Campaña relacionada:</Typography>
                                    <Box width="100%" bgcolor={alpha(palette.background.default, .5)}
                                        textAlign="center" px={2} py={1} borderRadius={3}>
                                        <Link component={RouterLink} to={`/campaigns/${leadField?.related_campaign.id}`}>
                                            {leadField?.related_campaign.name}
                                        </Link>
                                    </Box>
                                </>
                            }
                            {leadField?.calculation_expression &&
                                <>
                                    <Typography variant="body1" fontWeight="bold">Fórmula de Cálculo:</Typography>
                                    <Box width="100%" bgcolor={alpha(palette.background.default, .5)}
                                        textAlign="center" px={2} py={1} borderRadius={3}>
                                        <Typography variant="body1">
                                            {leadField?.calculation_expression}
                                        </Typography>
                                    </Box>
                                </>
                            }
                        </Stack>
                    }
                </Stack>
                <Grid container gap={2}>
                    {leadField?.default_value &&
                        <Grid size="grow" minWidth="18rem">
                            <>
                                <Typography variant="body1" fontWeight="bold">Valor por Defecto:</Typography>
                                <Typography variant="body1" paddingInlineStart={2}>
                                    {leadField?.default_value}
                                </Typography>
                            </>
                        </Grid>
                    }
                    <Grid size="grow" minWidth="18rem">
                        {leadField?.input_mask &&
                            <>
                                <Typography variant="body1" fontWeight="bold">Máscara de Entrada:</Typography>
                                <Typography variant="body1" paddingInlineStart={2}>
                                    {leadField?.input_mask}
                                </Typography>
                            </>
                        }

                    </Grid>
                </Grid>
                <Divider />
                <ValidationList leadField={leadField} handleSidebar={handleSidebar} />
                <Divider />
                <Grid container gap={1} >
                    <Grid size="grow" minWidth="18rem" gap={1}>
                        <Typography variant="body1" fontWeight="bold">Fecha de creación:</Typography>
                        <Typography variant="body1" paddingInlineStart={2} sx={{ textTransform: "capitalize" }}>
                            {dayjs(leadField?.created_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                        </Typography>
                    </Grid>
                    <Grid size="grow" minWidth="18rem">
                        <Typography variant="body1" fontWeight="bold">Fecha de última modificación:</Typography>

                        <Typography variant="body1" paddingInlineStart={2} sx={{ textTransform: "capitalize" }}>
                            {dayjs(leadField?.updated_at).format('dddd DD/MM/YYYY HH:mm:ss')}
                        </Typography>
                    </Grid>
                </Grid>
                <Divider />
                <ButtonGroup sx={{ marginLeft: "auto" }}>
                    <CommonButton handleClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    {leadField.order > 1 && //Si no se separa el condicional arruina el estilo del ButtonGroup
                        <DisableButton active={leadField.active} handleActive={() => handleActive(leadField)} />
                    }
                    {leadField.order > 1 &&
                        <CommonButton handleClick={() => handleSidebar("UPDATE_FIELD", leadField)} actionType="MODIFY" >Modificar</CommonButton>
                    }
                </ButtonGroup>
            </Stack>
        </Stack >
    )
}
