
import { ValidationList } from '../validations/ValidationList';
import TitleAndActive from 'src/components/ui/details/TitleAndActive';
import CustomChip from 'src/components/ui/details/CustomChip';
import CommonButton from 'src/components/ui/buttons/CommonButton';
import HandleActiveButton from 'src/components/ui/buttons/HandleActiveButton';
import DetailsMetadata from 'src/components/ui/details/DetailsMetadata';
import { disableLeadField, enableLeadField } from './leadFieldServices';
import type { LeadFieldDetailed } from 'src/types/leadFields'
import type { CampaignDetailed } from 'src/types/campaigns';
import { Link as RouterLink } from 'react-router-dom'
import { Grid, Stack, Typography, Divider, Link, ButtonGroup, Box } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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
        <Stack spacing={3} >
            <TitleAndActive active={leadField.active} >
                <Typography variant="h2">{leadField.name}</Typography>
            </TitleAndActive>
            <Stack spacing={2} >
                <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: "wrap", minWidth: "20rem", justifyContent: "space-between" }}>
                    <Stack sx={{ minWidth: "10rem" }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>Seccion:</Typography>
                        <Typography variant="body1" sx={{ pl: 2 }} >
                            {leadField.lead_field_section.name}
                        </Typography>
                    </Stack>
                    <Stack sx={{ minWidth: "10rem" }}>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>Modo de Creación:</Typography>
                        <Typography variant="body1" sx={{ pl: 2 }}>
                            {leadField.field_template_name && <span style={{ fontWeight: "bold" }}>Plantilla: </span>}
                            {leadField.field_template_name ? `${leadField.field_template_name}` : "Creación Manual"}
                        </Typography>
                    </Stack>
                </Stack>
                <Stack spacing={1} direction="row" useFlexGap sx={{ flexWrap: "wrap", justifyContent: "center" }}>
                    {leadField.required ? <CustomChip color='success' label="Obligatorio" size="small" /> :
                        <CustomChip color='error' label="Opcional" size="small" />}
                    {leadField.is_primary ? <CustomChip color='success' label="Único" size="small" /> :
                        <CustomChip color='error' label="Repetible" size="small" />}
                    {leadField.is_visible ? <CustomChip color='success' label="Visible" size="small" /> :
                        <CustomChip color='error' label="Oculto" size="small" />}
                </Stack>
                <Divider />
                <Stack spacing={2}>
                    <Typography variant="h3" sx={{ fontWeight: "bold" }}>Tipo {leadField.field_subtype?.description ? `/ Subtipo` : ""} de dato</Typography>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", justifyContent: "center" }}>
                        <CustomChip color='primary' label={leadField.field_type.description} size="xlarge" />
                        {leadField.field_subtype?.description &&
                            <>
                                <ArrowForwardIcon />
                                <CustomChip color='info' label={leadField.field_subtype?.description} size="large" />
                            </>
                        }
                    </Stack>
                    {(leadField?.nomenclator || leadField?.related_campaign || leadField?.calculation_expression) &&
                        <Stack spacing={1} sx={{ alignItems: "start" }}>
                            {leadField?.nomenclator &&
                                <>
                                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>Selector:</Typography>
                                    <Box sx={{
                                        width: "100%", bgcolor: alpha(palette.background.default, .5),
                                        textAlign: "center", px: 2, py: 1, borderRadius: 3
                                    }}>
                                        <Typography variant="body1">
                                            {leadField?.nomenclator.name}
                                        </Typography>
                                    </Box>
                                </>
                            }
                            {leadField?.related_campaign &&
                                <>
                                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>Campaña relacionada:</Typography>
                                    <Box sx={{
                                        width: "100%", bgcolor: alpha(palette.background.default, .5),
                                        textAlign: "center", px: 2, py: 1, borderRadius: 3
                                    }}>
                                        <Link component={RouterLink} to={`/campaigns/${leadField?.related_campaign.id}`}>
                                            {leadField?.related_campaign.name}
                                        </Link>
                                    </Box>
                                </>
                            }
                            {leadField?.calculation_expression &&
                                <>
                                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>Fórmula de Cálculo:</Typography>
                                    <Box sx={{
                                        width: "100%", bgcolor: alpha(palette.background.default, .5),
                                        textAlign: "center", px: 2, py: 1, borderRadius: 3
                                    }}>
                                        <Typography variant="body1">
                                            {leadField?.calculation_expression}
                                        </Typography>
                                    </Box>
                                </>
                            }
                        </Stack>
                    }
                </Stack>
                <Stack useFlexGap direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                    {leadField?.default_value &&
                        <Grid size="grow" sx={{ minWidth: "18rem" }}>
                            <>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>Valor por Defecto:</Typography>
                                <Box sx={{
                                    width: "100%", bgcolor: alpha(palette.background.default, .5),
                                    textAlign: "center", px: 2, py: 1, borderRadius: 3
                                }}>
                                    <Typography variant="body1">
                                        {leadField?.default_value}
                                    </Typography>
                                </Box>
                            </>
                        </Grid>
                    }
                    <Grid size="grow" sx={{ minWidth: "18rem" }}>
                        {leadField?.input_mask &&
                            <>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>Máscara de Entrada:</Typography>
                                <Box sx={{
                                    width: "100%", bgcolor: alpha(palette.background.default, .5),
                                    textAlign: "center", px: 2, py: 1, borderRadius: 3
                                }}>
                                    <Typography variant="body1">
                                        {leadField?.input_mask}
                                    </Typography>
                                </Box>
                            </>
                        }
                    </Grid>
                </Stack>
                <Stack spacing={3}>
                    <Divider />
                    <ValidationList leadField={leadField} handleSidebar={handleSidebar} />
                    <Divider />
                </Stack>
                <DetailsMetadata entity={leadField} />
                <Divider />
                <ButtonGroup sx={{ alignSelf: "end" }}>
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    {leadField.order > 1 && //Si no se separa el condicional arruina el estilo del ButtonGroup
                        <HandleActiveButton active={leadField.active} handleActive={() => handleActive(leadField)} />
                    }
                    {leadField.order > 1 &&
                        <CommonButton onClick={() => handleSidebar("UPDATE_FIELD", leadField)} actionType="MODIFY" >
                            Modificar
                        </CommonButton>
                    }
                </ButtonGroup>
            </Stack>
        </Stack >
    )
}
