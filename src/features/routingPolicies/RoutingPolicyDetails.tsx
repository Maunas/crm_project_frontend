import { useEffect, useState } from "react"
import { SidebarContentWrapper } from "shared/layout/container/GenericContainer"
import HandleActiveButton from "shared/ui/buttons/HandleActiveButton"
import DetailsMetadata from "shared/ui/details/DetailsMetadata"
import CommonButton from "shared/ui/buttons/CommonButton"
import { EnabledIcon } from "shared/ui/lists/Icons"
import { RoutingConditionRow } from "./RoutingConditionRow"
import type { LeadRoutingPolicyDetailed } from "src/types/routing"
import type { LeadField } from "src/types/leadFields"
import { getLeadFields } from "src/features/leadFields/leadFieldServices"
import { ButtonGroup, Chip, Divider, Stack, Typography } from "@mui/material"
import { Can } from "src/app/Can"

interface RoutingPolicyDetailsProps {
    policy: LeadRoutingPolicyDetailed | null,
    closeSidebar: () => void,
    handleSidebar: (mode: string, policy: LeadRoutingPolicyDetailed | null) => void,
    handleToggleActive: (policy: LeadRoutingPolicyDetailed) => void,
    handleDeleteForever: (policy: LeadRoutingPolicyDetailed) => void,
}

export const RoutingPolicyDetails = ({ policy, closeSidebar, handleSidebar, handleToggleActive, handleDeleteForever }: RoutingPolicyDetailsProps) => {

    const [leadFields, setLeadFields] = useState<LeadField[]>([])

    useEffect(() => {
        if (!policy) return
        // policy.target_team/campaign son los objetos anidados con el uuid real (Fase 4, ver
        // backend/AGENTS.md §18) -- ya no hace falta traer el catálogo completo de equipos/
        // campañas solo para resolver el nombre.
        if (policy.campaign) {
            getLeadFields({ campaign_id: policy.campaign.id, only_active: false, page_size: 0 }).then(res => setLeadFields(res.items))
        } else {
            setLeadFields([])
        }
    }, [policy])

    if (policy) return (
        <SidebarContentWrapper title={policy.name} icon={<EnabledIcon active={policy.active} isAvatar />}
            iconColor={policy.active ? "success" : "error"}
            subtitle="Política de Enrutamiento"
            actions={
                <ButtonGroup>
                    <CommonButton onClick={closeSidebar} actionType="CLOSE" variant="outlined" >Cerrar</CommonButton>
                    <Can permission={policy.active ? "lead_routing_policy:delete" : "lead_routing_policy:update"}>
                        <HandleActiveButton active={policy.active} handleActive={() => handleToggleActive(policy)} />
                    </Can>
                    <Can permission="lead_routing_policy:update">
                        <CommonButton onClick={() => handleSidebar("UPDATE_POLICY", policy)} actionType="MODIFY" >Modificar</CommonButton>
                    </Can>
                    <Can permission="lead_routing_policy:delete">
                        <CommonButton onClick={() => handleDeleteForever(policy)} actionType="DISABLE" color="error" variant="outlined">
                            Eliminar definitivamente
                        </CommonButton>
                    </Can>
                </ButtonGroup>
            }>
            <Stack spacing={2}>
                {policy.description &&
                    <Typography variant="body1" color="textSecondary">{policy.description}</Typography>
                }
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                    <Chip size="small" label={`Prioridad ${policy.priority}`} />
                    <Chip size="small" color="info" label={campaign ? `Campaña: ${campaign.name}` : "Política Global"} />
                    <Chip size="small" color="primary" label={`Equipo destino: ${team?.name ?? policy.target_team_id}`} />
                    <Chip size="small" label={policy.logical_operator === "AND" ? "Se deben cumplir TODAS" : "Alcanza con UNA"} />
                </Stack>
                <DetailsMetadata entity={policy} />
                <Divider />
                <Typography variant="h3">Condiciones</Typography>
                <Stack spacing={1.5}>
                    {policy.conditions.length > 0 ? policy.conditions.map(cond => (
                        <RoutingConditionRow key={cond.id} condition={cond} campaignId={policy.campaign_id ?? null}
                            fields={leadFields} isOnly readOnly
                            onUpdate={() => { }} onDelete={() => { }} />
                    )) : (
                        <Typography variant="body2" color="textSecondary">
                            Esta política no tiene condiciones, por lo que nunca va a asignar leads.
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </SidebarContentWrapper>
    )
}
