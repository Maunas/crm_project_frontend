import { useState } from 'react';
import { ValidationList } from '../validations/ValidationList';
import { getTypeIconAndColor, LeadFieldTypeAvatar } from './LeadFieldTypeIcon';
import { SidebarContentWrapper } from 'shared/layout/container/GenericContainer';
import { DisableConfirmDialog } from 'shared/feedback/ConfirmationDialog';
import HandleActiveButton from 'shared/ui/buttons/HandleActiveButton';
import { CustomListItem } from 'shared/ui/lists/CustomListItem';
import DetailsMetadata from 'shared/ui/details/DetailsMetadata';
import CommonButton from 'shared/ui/buttons/CommonButton';
import CustomChip from 'shared/ui/details/CustomChip';
import { EnabledIcon } from 'shared/ui/lists/Icons';
import { CodeBox } from 'shared/ui/details/CodeBox';
import type { LeadFieldDetailed } from 'src/types/leadFields'
import { disableLeadField, enableLeadField } from './leadFieldServices';
import { showCommonErrorToast, showToast } from 'src/utils/feedback';
import { Link as RouterLink } from 'react-router-dom'
import { Stack, Typography, Divider, Link, ButtonGroup, Paper, ListItemText } from '@mui/material'

interface LeadFieldDetailProps {
    leadField: LeadFieldDetailed,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
    updateEntity: (mode: string, entity: LeadFieldDetailed) => void,
    closeSidebar: () => void,
    leadFieldListLength?: number,
    campaignName: string
}

export const LeadFieldDetail = ({ leadField, updateEntity, handleSidebar, closeSidebar, campaignName, leadFieldListLength = 0 }: LeadFieldDetailProps) => {

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
                        updateEntity("DELETE_FIELD", leadField)
                        closeSidebar()
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

    return (
        <SidebarContentWrapper subtitle={campaignName}
            title={<span>{leadField.name}</span>} avatar={<EnabledIcon active={leadField.active} />}
            actions={
                <ButtonGroup sx={{ ml: "auto" }}>
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    {leadFieldListLength > 1 && //Si no se separa el condicional arruina el estilo del ButtonGroup
                        <HandleActiveButton active={leadField.active} handleActive={() => setDeletingField(leadField)} />
                    }
                    {leadFieldListLength > 1 &&
                        <CommonButton onClick={() => handleSidebar("UPDATE_FIELD", leadField)} actionType="MODIFY" >
                            Modificar
                        </CommonButton>
                    }
                </ButtonGroup>
            }>
            <Stack spacing={2} sx={{ height: "100%" }}>
                <Stack spacing={2} sx={{ flexGrow: 1, justifyItems: "start" }}>
                    <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: "wrap", minWidth: "20rem", justifyContent: "space-between" }}>
                        <Stack sx={{ minWidth: "10rem" }}>
                            <Typography variant="subtitle2" color="textSecondary">Seccion:</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {leadField.lead_field_section.name}
                            </Typography>
                        </Stack>
                        <Stack sx={{ minWidth: "10rem" }}>
                            {leadField.field_template_name &&
                                <Typography variant="subtitle2" color="textSecondary">
                                    Creado por plantilla:
                                </Typography>}
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {leadField.field_template_name ? leadField.field_template_name : "Creado manualmente"}
                            </Typography>
                        </Stack>
                    </Stack>
                    <Stack spacing={1} direction="row" useFlexGap sx={{ flexWrap: "wrap", justifyContent: "center" }}>
                        {leadField.required ? <CustomChip chipColor='success' label="Obligatorio" /> :
                            <CustomChip chipColor='error' label="Opcional" />}
                        {leadField.is_primary ? <CustomChip chipColor='success' label="Único" /> :
                            <CustomChip chipColor='error' label="Repetible" />}
                        {leadField.is_visible ? <CustomChip chipColor='success' label="Visible" /> :
                            <CustomChip chipColor='error' label="Oculto" />}
                    </Stack>
                    <Divider />
                    <Stack spacing={1}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>Tipo {leadField.field_subtype?.description ? `/ Subtipo` : ""} de Dato</Typography>
                        <CustomListItem color={getTypeIconAndColor(leadField.field_type?.code, leadField.field_subtype?.code).color} isSelected>
                            <LeadFieldTypeAvatar typeCode={leadField.field_type?.code} subtypeCode={leadField.field_subtype?.code} />
                            <ListItemText primary={leadField.field_type.description} secondary={leadField.field_subtype?.description} />
                        </CustomListItem>
                        {(leadField?.nomenclator || leadField?.related_campaign || leadField?.calculation_expression) &&
                            <Stack spacing={1} sx={{ alignItems: "start" }}>
                                <Paper elevation={7} sx={{ width: "100%", overflow: "hidden" }}>
                                    <Typography variant="body1" sx={{ py: 1, px: 2 }}>
                                        {leadField?.nomenclator ? "Selector" : ""}
                                        {leadField?.related_campaign ? "Campaña relacionada" : ""}
                                        {leadField?.calculation_expression ? "Fórmula de Cálculo" : ""}
                                    </Typography>
                                    <CodeBox>
                                        {leadField?.nomenclator &&
                                            <Typography variant="body1">
                                                {leadField?.nomenclator.name}
                                            </Typography>
                                        }
                                        {leadField?.related_campaign &&
                                            <Link component={RouterLink} to={`/campaigns/${leadField?.related_campaign.id}`}>
                                                {leadField?.related_campaign.name}
                                            </Link>
                                        }
                                        {leadField?.calculation_expression &&
                                            leadField?.calculation_expression
                                        }
                                    </CodeBox>
                                </Paper>
                            </Stack>
                        }
                    </Stack>
                    {(leadField?.default_value || leadField?.input_mask) &&
                        <Stack useFlexGap direction="row" spacing={2} sx={{ flexWrap: "wrap", width: "100%" }}>
                            {leadField?.default_value &&
                                <Paper elevation={7} sx={{ flexGrow: 1, overflow: "hidden" }}>
                                    <Typography variant="body1" sx={{ py: 1, px: 2 }}>
                                        Valor por Defecto
                                    </Typography>
                                    <CodeBox>
                                        <Typography variant="body1">
                                            {leadField?.default_value}
                                        </Typography>
                                    </CodeBox>
                                </Paper>
                            }
                            {leadField?.input_mask &&
                                <Paper elevation={7} sx={{ flexGrow: 1, overflow: "hidden" }}>
                                    <Typography variant="body1" sx={{ py: 1, px: 2 }}>
                                        Máscara
                                    </Typography>
                                    <CodeBox>
                                        <Typography variant="body1">
                                            {leadField?.input_mask}
                                        </Typography>
                                    </CodeBox>
                                </Paper>
                            }
                        </Stack>}
                    <Divider />
                    <DetailsMetadata entity={leadField} />
                    <Divider />
                    <Stack spacing={3}>
                        <ValidationList leadField={leadField} handleSidebar={handleSidebar} />
                    </Stack>
                </Stack>
            </Stack >
            <DisableConfirmDialog entity={deletingField} clearEntity={() => setDeletingField(null)} idModal='dis-field-det'
                onConfirm={() => handleActive(deletingField)} entityTypeName="el campo" />
        </SidebarContentWrapper >
    )
}
