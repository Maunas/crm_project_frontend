import { Draggable } from '@hello-pangea/dnd';
import { Card, Typography, Box, Avatar, Stack, Chip, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import type { Lead } from 'src/types/leads';
import { getLeadTitleArray } from '../../leadUtils';
import CustomChip from 'src/components/ui/details/CustomChip'

interface LeadBoardCardProps {
    lead: Lead;
    index: number;
    // Nueva prop para recibir el observer del scroll infinito
    observerRef?: (node: HTMLDivElement | null) => void;
}

export const LeadBoardCard = ({ lead, index, observerRef }: LeadBoardCardProps) => {
    const titleArray = getLeadTitleArray(lead);
    const mainTitle = titleArray[0] || "Sin nombre";
    const subTitle = titleArray.slice(1).join(" • ");

    return (
        <Draggable draggableId={String(lead.id)} index={index}>
            {(provided, snapshot) => (
                <Card
                    // UNIMOS LOS DOS REFS (El de la librería DND y nuestro Observer de scroll)
                    ref={(node) => {
                        provided.innerRef(node);
                        if (observerRef) observerRef(node);
                    }}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    elevation={snapshot.isDragging ? 8 : 1}
                    sx={{
                        p: 2,
                        mb: 1.5, // USAMOS MARGIN BOTTOM AQUÍ EN VEZ DEL GAP DEL STACK PADRE
                        borderRadius: 2,
                        cursor: 'grab',
                        backgroundColor: 'background.paper',
                        // ELIMINAMOS transform Y transition DE AQUÍ PARA EVITAR CONFLICTOS
                    }}
                    // VITAL: Esto aplica las físicas exactas calculadas por la librería (evita el salto lateral)
                    style={provided.draggableProps.style}
                >
                    {/* El contenido interno de la tarjeta puede usar Stack sin problemas */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar 
                                src={lead.picture_avatar_url || undefined} 
                                sx={{ width: 40, height: 40 }}
                            >
                                {!lead.picture_avatar_url && mainTitle.charAt(0)}
                            </Avatar>
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="subtitle2" noWrap fontWeight="bold">
                                    {mainTitle}
                                </Typography>
                                {subTitle && (
                                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                                        {subTitle}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>

                        {lead.tags && lead.tags.length > 0 && (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {lead.tags.map(tag => (
                                    <CustomChip 
                                        key={tag.id} 
                                        label={tag.name} 
                                        color={tag.color as any} 
                                        size="small" 
                                    />
                                ))}
                            </Stack>
                        )}

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            {lead.current_state_id ? (
                                <Chip label={`Estado #${lead.current_state_id}`} size="small" variant="outlined" />
                            ) : <Box />}

                            <Stack direction="row" spacing={1}>
                                {lead.team_id && (
                                    <Tooltip title={`Equipo #${lead.team_id}`}>
                                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                                            <GroupsIcon sx={{ fontSize: 16 }} />
                                        </Avatar>
                                    </Tooltip>
                                )}
                                {lead.assigned_to_user_id && (
                                    <Tooltip title={`Usuario asignado`}>
                                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                                            <PersonIcon sx={{ fontSize: 16 }} />
                                        </Avatar>
                                    </Tooltip>
                                )}
                            </Stack>
                        </Stack>
                    </Stack>
                </Card>
            )}
        </Draggable>
    );
};