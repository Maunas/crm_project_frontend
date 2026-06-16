import { Divider, List, ListItemButton, ListSubheader, Popover, Stack } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import GenericPaper from 'src/components/layout/container/GenericPaper'
import CustomChip from 'src/components/ui/details/CustomChip'
import { getNextFlowState } from 'src/features/leadFlows/leadFlowServices/FlowService'
import { getContactStates } from 'src/features/leadProperties/contactStatesServices'
import type { LeadContactState, LeadContactStateDetailed } from 'src/types/contactState'
import type { LeadState, LeadStateDetailed } from 'src/types/leadFlow'
import type { Lead, LeadDetailed } from 'src/types/leads'
import { changeContactState, changeFlowState } from './LeadDetailsService'
import { showCommonErrorToast } from 'src/utils/feedback'

interface LeadDetailsState {
    lead: LeadDetailed,
    contactState: LeadContactStateDetailed,
    flowState: LeadStateDetailed,
    updateLeadInfo: (lead: LeadDetailed, reloadAudits?: boolean) => void
}

export const LeadDetailsState = ({ lead, contactState, flowState, updateLeadInfo }: LeadDetailsState) => {

    const [nextFlowStates, setNextFlowStates] = useState<LeadState[]>([])
    const [contactStates, setContactStates] = useState<LeadContactState[]>([])

    useEffect(() => {
        getContactStates({ only_active: true, page_size: 0, detailed: false })
            .then(res => setContactStates(res.items.filter(i => i.id !== contactState.id)))
    }, [contactState])

    useEffect(() => {
        getNextFlowState(flowState.id)
            .then(res => setNextFlowStates(res.data))
    }, [flowState])

    const [flowAnchor, setFlowAnchor] = useState<Element | null>(null)
    const [contactAnchor, setContactAnchor] = useState<Element | null>(null)

    const handleContactChange = useCallback((newLead: Lead) => {
        const leadCopy = { ...lead }
        leadCopy.contact_state = { ...lead.contact_state, ...newLead.contact_state }
        leadCopy.contact_state_id = newLead.contact_state_id
        updateLeadInfo(leadCopy)
    }, [lead, updateLeadInfo])


    const handleFlowChange = useCallback((newLead: LeadDetailed) => {
        updateLeadInfo(newLead, true)
    }, [updateLeadInfo])

    return (
        <Stack spacing={1} direction="row" useFlexGap sx={{ alignItems: "center", justifyContent: "start", flexWrap: "wrap" }}>
            {flowState && setNextFlowStates?.length > 0 && <>
                <CustomChip label={flowState.name} chipColor={flowState.color} onClick={e => setFlowAnchor(e.currentTarget)} />
                <Popover
                    id="next-flow-states"
                    open={Boolean(flowAnchor)}
                    anchorEl={flowAnchor}
                    onClose={() => setFlowAnchor(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <FlowStateList leadId={lead.id} nextFlowStates={nextFlowStates}
                        onClose={() => setFlowAnchor(null)} onChange={handleFlowChange} />
                </Popover>
            </>}

            {contactState && contactStates?.length > 0 && <>
                <CustomChip label={contactState.name} chipColor={contactState.color} onClick={e => setContactAnchor(e.currentTarget)} />
                <Popover
                    id="next-cont-states"
                    open={Boolean(contactAnchor)}
                    anchorEl={contactAnchor}
                    onClose={() => setContactAnchor(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                >
                    <ContactStateList leadId={lead.id} contactStates={contactStates}
                        onClose={() => setContactAnchor(null)} onChange={handleContactChange} />
                </Popover>
            </>}
        </Stack>
    )
}

interface StateListProps {
    leadId: number,
    onClose: () => void
}

interface FlowStateListProps extends StateListProps {
    nextFlowStates: LeadState[],
    onChange: (lead: LeadDetailed) => void
}
const FlowStateList = ({ leadId, nextFlowStates, onClose, onChange }: FlowStateListProps) => {

    const handleClick = (flowId: number) => {
        changeFlowState(leadId, flowId)
            .then(lead => {
                onChange(lead)
                onClose()
            })
            .catch(e => showCommonErrorToast(e))
    }
    return (
        <List component={GenericPaper} elevation={1} dense
            sx={{ minWidth: "10rem", maxWidth: "25rem", p: 0 }}
            aria-labelledby="next-flow-states"
            subheader={
                <ListSubheader id="next-flow-subheader" sx={{ backgroundColor: "transparent" }}>
                    Actualizar Estado de Flujo
                </ListSubheader>
            }
        >
            <Divider />
            {nextFlowStates.map(state => (
                <ListItemButton onClick={() => handleClick(state.id)} key={`flow-state-${state.id}`}>
                    <CustomChip label={state.name} chipColor={state.color} sx={{ width: "100%" }} />
                </ListItemButton>
            ))}

        </List>
    )
}

interface ContactStateListProps extends StateListProps {
    contactStates: LeadContactState[],
    onChange: (lead: Lead) => void
}
const ContactStateList = ({ leadId, contactStates, onClose, onChange }: ContactStateListProps) => {

    const handleClick = (contactId: number) => {
        changeContactState(leadId, contactId)
            .then(lead => {
                onChange(lead)
                onClose()
            })
            .catch(e => showCommonErrorToast(e))
    }

    return (
        <List component={GenericPaper} elevation={1} dense
            sx={{ minWidth: "10rem", maxWidth: "25rem", p: 0 }}
            aria-labelledby="next-cont-states"
            subheader={
                <ListSubheader id="next-cont-subheader" sx={{ backgroundColor: "transparent" }}>
                    Actualizar Estado de Contacto
                </ListSubheader>
            }
        >
            <Divider />
            {contactStates.map(state => (
                <ListItemButton onClick={() => handleClick(state.id)} key={`cont-state-${state.id}`}>
                    <CustomChip label={state.name} chipColor={state.color} sx={{ width: "100%" }} />
                </ListItemButton>
            ))}

        </List>
    )
}