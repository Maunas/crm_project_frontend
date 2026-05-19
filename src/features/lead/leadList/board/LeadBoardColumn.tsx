import { useState, useEffect, useCallback, useRef } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Stack, Typography, Box, alpha, CircularProgress } from '@mui/material';
import type { LeadContactState } from 'src/types/leadContactState';
import type { Lead } from 'src/types/leads';
import { getFilteredLeads } from '../../leadService';
import { LeadBoardCard } from './LeadBoardCard';

interface LeadBoardColumnProps {
    column: LeadContactState;
    campaignId: number | string;
    activeFilters: any[];
    dragHandleProps: any;
}

export const LeadBoardColumn = ({ column, campaignId, activeFilters, dragHandleProps }: LeadBoardColumnProps) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    
    // Referencia para el intersection observer (scroll infinito)
    const observer = useRef<IntersectionObserver | null>(null);
    const lastLeadElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Fetch leads
    useEffect(() => {
        setLoading(true);
        // Enviamos el contact_state_id como filtro para esta columna específica
        const filters = [...activeFilters, { field_id: "contact_state_id", operator: "eq", value: column.id }];
        
        getFilteredLeads({ filters }, { campaign_id: Number(campaignId), page, page_size: 15 })
            .then(res => {
                setLeads(prev => page === 1 ? res.items : [...prev, ...res.items]);
                setHasMore(res.page < res.total_pages);
            })
            .finally(() => setLoading(false));
    }, [campaignId, column.id, page, activeFilters]);

    useEffect(() => {
        const handleLeadMoved = (e: any) => {
            const { leadId, sourceId, destinationId, sourceIndex, destinationIndex } = e.detail;

            if (sourceId === String(column.id) && destinationId === String(column.id)) {
                setLeads(prevLeads => {
                    const newLeads = Array.from(prevLeads);
                    const [movedLead] = newLeads.splice(sourceIndex, 1);
                    newLeads.splice(destinationIndex, 0, movedLead);
                    return newLeads;
                });
                return;
            }

            if (sourceId === String(column.id)) {
                setLeads(prevLeads => {
                    const leadToMove = prevLeads.find(l => l.id === leadId);
                    if (leadToMove) {
                        window.dispatchEvent(new CustomEvent('receive-lead', {
                            detail: { lead: { ...leadToMove, contact_state_id: Number(destinationId) }, destinationId, destinationIndex }
                        }));
                    }
                    return prevLeads.filter(l => l.id !== leadId);
                });
            }
        };

        const handleReceiveLead = (e: any) => {
            const { lead, destinationId, destinationIndex } = e.detail;
            if (destinationId === String(column.id)) {
                setLeads(prevLeads => {
                    const newLeads = Array.from(prevLeads);
                    if (!newLeads.find(l => l.id === lead.id)) {
                        newLeads.splice(destinationIndex, 0, lead);
                    }
                    return newLeads;
                });
            }
        };

        window.addEventListener('lead-moved', handleLeadMoved);
        window.addEventListener('receive-lead', handleReceiveLead);
        return () => {
            window.removeEventListener('lead-moved', handleLeadMoved);
            window.removeEventListener('receive-lead', handleReceiveLead);
        };
    }, [column.id]);

    return (
        <Box sx={{ 
            minWidth: 300, 
            maxWidth: 300, 
            backgroundColor: theme => alpha(theme.palette.background.paper, 0.5), 
            borderRadius: 2, 
            display: 'flex', 
            flexDirection: 'column',
            borderTop: `4px solid ${column.color || '#ccc'}`,
            height: '100%'
        }}>
            {/* CABECERA: Acoplamos dragHandleProps aquí para arrastrar la columna desde el título */}
            <Box 
                {...dragHandleProps} 
                sx={{ 
                    p: 2, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' },
                    userSelect: 'none'
                }}
            >
                <Typography variant="subtitle1" fontWeight="bold">
                    {column.name} ({leads.length})
                </Typography>
            </Box>

            {/* ZONA DROPPABLE INTERNA (Para las Tarjetas de Leads) */}
            <Droppable droppableId={String(column.id)} type="card">
                {(provided, snapshot) => (
                    <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ 
                            flexGrow: 1, 
                            p: 1.5, 
                            overflowY: 'auto',
                            backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                            transition: 'background-color 0.2s ease',
                        }}
                    >
                        <Stack spacing={1.5}>
                            {leads.map((lead, index) => {
                                const isLast = index === leads.length - 1;
                                return (
                                    <div ref={isLast ? lastLeadElementRef : null} key={lead.id}>
                                        <LeadBoardCard lead={lead} index={index} />
                                    </div>
                                );
                            })}
                            {provided.placeholder}
                            {loading && <CircularProgress size={24} sx={{ alignSelf: 'center', my: 2 }} />}
                        </Stack>
                    </Box>
                )}
            </Droppable>
        </Box>
    );
};