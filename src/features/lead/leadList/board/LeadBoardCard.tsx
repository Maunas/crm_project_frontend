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
}

export const LeadBoardCard = ({ lead, index }: LeadBoardCardProps) => {
    // Obtenemos los campos principales a mostrar
    const titleArray = getLeadTitleArray(lead);
    const mainTitle = titleArray[0] || "Sin nombre";
    const subTitle = titleArray.slice(1).join(" • ");

    return (
        <Draggable draggableId={String(lead.id)} index={index}>
            {(provided, snapshot) => (
                <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    elevation={snapshot.isDragging ? 8 : 1}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: 'grab',
                        backgroundColor: 'background.paper',
                        transform: snapshot.isDragging ? 'rotate(3deg)' : 'none',
                        transition: 'transform 0.1s ease',
                    }}
                >
                    <Stack spacing={1.5}>
                        {/* Cabecera: Avatar y Título */}
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

                        {/* Etiquetas (Tags) */}
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

                        {/* Footer de la tarjeta: Estado del funnel y Usuario/Equipo */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            {/* Opcional: mostrar current_state del Flow Estricto */}
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