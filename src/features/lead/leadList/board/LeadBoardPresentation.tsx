import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import type {DropResult} from '@hello-pangea/dnd';
import { Stack, Box, Typography, CircularProgress } from '@mui/material';
import type { LeadContactState } from 'src/types/leadContactState';
import { LeadBoardColumn } from './LeadBoardColumn';
import { updateLead, changeContactStateLead } from '../../leadService';
import { getLeadContactStates, updateLeadContactState } from 'src/services/leadContactStateService';

interface LeadBoardPresentationProps {
    campaignId: number | string;
    activeFilters: any[]; // Pásale los filtros activos si quieres que el tablero también se filtre
}

export const LeadBoardPresentation = ({ campaignId, activeFilters }: LeadBoardPresentationProps) => {
    const [columns, setColumns] = useState<LeadContactState[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Traer los estados (columnas) de la organización
    useEffect(() => {
        getLeadContactStates({ page_size: 0, only_active: true })
            .then(res => {
                setColumns(res.items);
            })
            .finally(() => setLoading(false));
    }, []);

    

    // 2. Gestionar el final del arrastre (Tarjetas o Columnas)
    const onDragEnd = useCallback(async (result: DropResult) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // =================================================================
        // CASO A: ARRASTRE DE COLUMNAS (Mover Estados)
        // =================================================================
        if (type === 'column') {
            const reorderedColumns = Array.from(columns);
            const [movedColumn] = reorderedColumns.splice(source.index, 1);
            reorderedColumns.splice(destination.index, 0, movedColumn);

            // Reasignamos el orden localmente basándonos en sus nuevos índices (UI Optimista)
            const updatedColumnsWithOrder = reorderedColumns.map((col, idx) => ({
                ...col,
                order: idx + 1 // O la lógica secuencial que prefieras de tu backend
            }));

            setColumns(updatedColumnsWithOrder);

            // Persistir el nuevo orden en el backend enviando un FormData
            try {
                const targetColumnId = Number(draggableId);
                const newOrderValue = destination.index + 1; // Ajusta según empiece en 0 o 1 en tu BD

                const formData = new FormData();
                formData.append('order', newOrderOrderValue.toString());
                formData.append('name', movedColumn.name); // Asegurar campos requeridos si aplica

                await updateLeadContactState(formData, targetColumnId);
            } catch (error) {
                console.error("Error al actualizar el orden de la columna en la BD", error);
            }
            return;
        }

        // =================================================================
        // CASO B: ARRASTRE DE TARJETAS (Mover Leads - Lógica Existente)
        // =================================================================
        const leadId = Number(draggableId);
        const sourceId = source.droppableId;
        const destinationId = destination.droppableId;

        window.dispatchEvent(new CustomEvent('lead-moved', {
            detail: { 
                leadId, 
                sourceId, 
                destinationId, 
                sourceIndex: source.index, 
                destinationIndex: destination.index 
            }
        }));

        if (sourceId !== destinationId) {
            try {
                await changeContactStateLead(leadId, Number(destinationId));
            } catch (error) {
                console.error("Error al cambiar el estado del lead", error);
            }
        }
    }, [columns]);

    if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {/* Contenedor principal Droppable para las columnas (tipo horizontal) */}
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
                {(provided) => (
                    <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ 
                            display: 'flex', 
                            overflowX: 'auto', 
                            height: 'calc(100vh - 250px)', 
                            gap: 2, 
                            pb: 2 
                        }}
                    >
                        {columns.map((column, index) => (
                            <Draggable 
                                key={column.id} 
                                draggableId={String(column.id)} 
                                index={index}
                            >
                                {(draggableProvided) => (
                                    <Box
                                        ref={draggableProvided.innerRef}
                                        {...draggableProvided.draggableProps}
                                        sx={{ height: '100%' }}
                                    >
                                        {/* Pasamos el dragHandleProps únicamente a la cabecera interna del componente */}
                                        <LeadBoardColumn 
                                            column={column} 
                                            campaignId={campaignId}
                                            activeFilters={activeFilters}
                                            dragHandleProps={draggableProvided.dragHandleProps}
                                        />
                                    </Box>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </Box>
                )}
            </Droppable>
        </DragDropContext>
    );
};