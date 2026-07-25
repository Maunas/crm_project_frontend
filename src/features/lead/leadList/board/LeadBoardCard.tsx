import { Draggable } from '@hello-pangea/dnd';
import { Card, Typography, Box, Avatar, Stack, Tooltip, alpha } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import type { Lead } from 'src/types/leads';
import { getLeadTitleArray } from '../../leadUtils';
import CustomChip from 'shared/ui/details/CustomChip';
import { useNavigate } from 'react-router-dom';
import { UserAvatar } from 'shared/ui/details/UserAvatar';

interface LeadBoardCardProps {
    lead: Lead;
    index: number;
    columnColor?: string;
    observerRef?: (node: HTMLDivElement | null) => void;
}

export const LeadBoardCard = ({ lead, index, columnColor, observerRef }: LeadBoardCardProps) => {
    const navigate = useNavigate();
    const titleArray = getLeadTitleArray(lead);
    const mainTitle = titleArray[0] || "Sin nombre";
    const subTitle = titleArray.slice(1).join(" • ");

    return (
        <Draggable draggableId={String(lead.id)} index={index}>
            {(provided, snapshot) => (
                <Card
                    ref={(node) => {
                        provided.innerRef(node);
                        if (observerRef) observerRef(node);
                    }}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    elevation={0}
                    onClick={() => { if (!snapshot.isDragging) navigate(`/leads/${lead.id}`) }}
                    sx={{
                        p: 2,
                        mb: 1.5,
                        borderRadius: 2,
                        cursor: snapshot.isDragging ? 'grabbing' : 'pointer',
                        // Fondo sólido para que se distinga claramente del fondo del board
                        backgroundColor: 'background.paper',
                        // Accent border izquierdo con el color de la columna
                        borderLeft: `3px solid ${columnColor || 'transparent'}`,
                        // Sombra en capas: cercanía + profundidad + tinte del color de columna
                        boxShadow: columnColor
                            ? `0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)`
                            : `0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)`,
                        transition: snapshot.isDragging
                            ? 'none'
                            : 'transform 0.15s ease, box-shadow 0.15s ease',
                        ...(!snapshot.isDragging && {
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: columnColor
                                    ? `0 4px 8px rgba(0,0,0,0.1), 0 12px 28px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04), 0 0 16px ${alpha(columnColor, 0.15)}`
                                    : `0 4px 8px rgba(0,0,0,0.1), 0 12px 28px rgba(0,0,0,0.12)`,
                            },
                        }),
                    }}
                    // VITAL: físicas exactas calculadas por la librería (evita el salto lateral)
                    style={provided.draggableProps.style}
                >
                    <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                            <UserAvatar
                                name={mainTitle}
                                src={lead.picture_avatar_url || undefined}
                                size={40}
                                sx={columnColor ? {
                                    outline: `2px solid ${alpha(columnColor, 0.4)}`,
                                    outlineOffset: '1px',
                                } : undefined}
                            />
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="subtitle2" noWrap sx={{ fontWeight: "bold" }}>
                                    {mainTitle}
                                </Typography>
                                {subTitle && (
                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                                        {subTitle}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>

                        {lead.tags && lead.tags.length > 0 && (
                            <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }} useFlexGap>
                                {lead.tags.map(tag => (
                                    <CustomChip
                                        key={tag.id}
                                        label={tag.name}
                                        chipColor={tag.color}
                                        size="small"
                                    />
                                ))}
                            </Stack>
                        )}

                        {(lead.team_id || lead.assigned_to_user_id) && (
                            <Stack direction="row" sx={{ justifyContent: "flex-end", alignItems: "center" }} spacing={1}>
                                {lead.team_id && (
                                    <Tooltip title="Equipo asignado">
                                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                                            <GroupsIcon sx={{ fontSize: 16 }} />
                                        </Avatar>
                                    </Tooltip>
                                )}
                                {lead.assigned_to_user_id && (
                                    <Tooltip title="Usuario asignado">
                                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                                            <PersonIcon sx={{ fontSize: 16 }} />
                                        </Avatar>
                                    </Tooltip>
                                )}
                            </Stack>
                        )}
                    </Stack>
                </Card>
            )
            }
        </Draggable >
    );
};
