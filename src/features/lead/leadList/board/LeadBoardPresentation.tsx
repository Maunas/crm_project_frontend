import { useEffect, useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Box, CircularProgress } from '@mui/material';
import { getLeadContactStates, updateLeadContactState } from 'src/services/leadContactStateService';
import type { LeadContactState } from 'src/types/leadContactState';
import { LeadBoardColumn } from './LeadBoardColumn';
import { changeContactStateLead } from '../../leadService';

interface LeadBoardPresentationProps {
    campaignId: number | string;
    activeFilters: any[];
}

export const LeadBoardPresentation = ({ campaignId, activeFilters }: LeadBoardPresentationProps) => {
    const [columns, setColumns] = useState<LeadContactState[]>([]);
    const [loading, setLoading] = useState(true);
    
    // ESTADOS NUEVOS PARA EL SCROLL GLOBAL
    const [isDragging, setIsDragging] = useState(false);
    const scrollContainerRef = useRef<HTMLElement | null>(null);

    // 1. Cargar estados
    useEffect(() => {
        getLeadContactStates({ page_size: 0, only_active: true })
            .then(res => setColumns(res.items))
            .finally(() => setLoading(false));
    }, []);

    // 2. Motor de Auto-Scroll Global Mejorado
    useEffect(() => {
        if (!isDragging) return; 

        let animationFrameId: number;
        let currentMouseX = -1; 

        const handleMouseMove = (e: MouseEvent) => {
            currentMouseX = e.clientX;
        };

        const autoScroll = () => {
            if (scrollContainerRef.current && currentMouseX !== -1) {
                const container = scrollContainerRef.current;
                
                // Obtenemos las coordenadas exactas del tablero en la pantalla
                const rect = container.getBoundingClientRect();

                // AUMENTAMOS la zona sensible a 200px (es más cómodo)
                const scrollZone = 200; 
                const speed = 20; // Aumentamos un pelín la velocidad (opcional)

                // Verificamos si el mouse está en la zona izquierda DEL TABLERO
                if (currentMouseX > rect.left && currentMouseX < rect.left + scrollZone) {
                    container.scrollLeft -= speed;
                } 
                // Verificamos si el mouse está en la zona derecha DEL TABLERO
                else if (currentMouseX < rect.right && currentMouseX > rect.right - scrollZone) {
                    container.scrollLeft += speed;
                }
            }
            animationFrameId = requestAnimationFrame(autoScroll);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animationFrameId = requestAnimationFrame(autoScroll);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDragging]);

    // 3. Evento al INICIAR el arrastre
    const onDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    // 4. Gestionar el final del arrastre
    const onDragEnd = useCallback(async (result: DropResult) => {
        setIsDragging(false); // Apagamos el scroll automático
        const { destination, source, draggableId, type } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // ARRASTRE DE COLUMNAS
        if (type === 'column') {
            const reorderedColumns = Array.from(columns);
            const [movedColumn] = reorderedColumns.splice(source.index, 1);
            reorderedColumns.splice(destination.index, 0, movedColumn);

            const updatedColumnsWithOrder = reorderedColumns.map((col, idx) => ({
                ...col,
                order: idx + 1
            }));

            setColumns(updatedColumnsWithOrder);

            try {
                const targetColumnId = Number(draggableId);
                const newOrderValue = destination.index + 1; 
                const formData = new FormData();
                formData.append('order', newOrderValue.toString());
                formData.append('name', movedColumn.name); 

                await updateLeadContactState(formData, targetColumnId);
            } catch (error) {
                console.error("Error al actualizar el orden de la columna en la BD", error);
            }
            return;
        }

        // ARRASTRE DE TARJETAS (Leads)
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
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
                {(provided) => (
                    <Box
                        // UNIMOS EL REF DE LA LIBRERÍA Y EL NUESTRO PARA EL SCROLL
                        ref={(node) => {
                            provided.innerRef(node);
                            scrollContainerRef.current = node;
                        }}
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