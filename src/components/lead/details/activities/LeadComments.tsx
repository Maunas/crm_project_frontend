import { useEffect, useState, type ReactNode } from "react"
import { CreateCommentWrapper, UpdateCommentFromNote } from "./LeadCommentForm"
import { PaginationComponent } from "../../../common/lists/PaginationComponent"
import type { Paginable } from "../../../../types/common"
import type { LeadComment } from "../../../../types/leads"
import type { ColorTypes } from "../../../../types/mui-theme.d"
import { useListPagination } from "../../../hooks/useListPagination"
import { deleteComment, getComments } from "./leadActivitiesService"
import dayjs from "dayjs"
import { Box, Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material"
import { alpha, styled, useTheme } from "@mui/material/styles"
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import PersonIcon from '@mui/icons-material/Person';

export const LeadComments = ({ leadId }: { leadId: number }) => {

    const [comments, setComments] = useState<Paginable<LeadComment> | null>(null)
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)
    const { fetchPage, pageSize, pageComponentProps } = useListPagination(comments, 12)

    useEffect(() => {
        getComments({ detailed: true, lead_id: leadId, page: fetchPage, page_size: pageSize })
            .then(setComments)
    }, [fetchPage, pageSize, leadId])

    const onDeleteComment = (comId: number) => {
        deleteComment(comId).then(() => {
            getComments({ detailed: true, lead_id: leadId, page: fetchPage, page_size: pageSize })
                .then(setComments)
        })
    }
    const onCreateComment = () => {
        getComments({ detailed: true, lead_id: leadId, page: fetchPage, page_size: pageSize })
            .then(setComments)
    }
    const onUpdateComment = (newCom: LeadComment) => {
        const newComments = [...(comments?.items ?? [])]
        const commentListIdx = newComments.findIndex(listCom => listCom.id === newCom.id)
        if (commentListIdx === -1) return
        newComments[commentListIdx] = newCom
        setComments({ ...comments, items: newComments } as Paginable<LeadComment> | null)
        setSelectedCommentId(null)
    }

    const { palette } = useTheme()

    return (
        <Stack gap={2} height="100%">
            <Stack flexGrow={1} gap={2} borderRadius={3} px={3} py={2}
                bgcolor={alpha(palette.background.default, .5)} alignItems="end">
                <Grid container justifyContent="end" alignItems="start" alignContent="start" width="100%"
                    flexGrow={1} gap={2} minWidth="20rem">
                    {comments?.items.map(com =>
                        <Grid key={com.id} size="grow" minWidth="20rem" >
                            {com.id !== selectedCommentId ? (
                                <CommentInstance comment={com} onEdit={() => setSelectedCommentId(com.id)}
                                    onDelete={() => onDeleteComment(com.id)} title={<MetadataShort comment={com} isUser />}
                                    footerContent={<MetadataShort comment={com} />} >
                                    {com.content}
                                </CommentInstance>
                            )
                                : <UpdateCommentFromNote leadId={leadId} existingComment={com} onUpdate={onUpdateComment} onClose={() => setSelectedCommentId(null)} />
                            }
                        </Grid>
                    )}
                </Grid>
                <PaginationComponent {...pageComponentProps} />
            </Stack>
            <Divider />
            <CreateCommentWrapper leadId={leadId} onCreate={onCreateComment} />
        </Stack>
    )
}

const CommentNote = styled(Paper)(({ theme, ...props }) => {
    const paletteColor = props.color as ColorTypes
    return ([{
        borderRadius: "1rem 1rem 0 1rem",
        border: `1px solid ${theme.palette[paletteColor].main}`,
        overflow: "hidden",
        color: theme.palette.text.primary,
        "& .comment-footer, .comment-header": {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
        },
        "& .comment-header": {
            backgroundColor: alpha(theme.palette[paletteColor].light, .5),
            borderBottom: `1px solid ${theme.palette[paletteColor].main}`,
        },
        "& .comment-footer": {
            backgroundColor: alpha(theme.palette[paletteColor].light, .5),
            borderTop: `1px solid ${theme.palette[paletteColor].main}`,
        },
        "& .comment-main": {
            minHeight: "3rem",
        },
    },
    theme.applyStyles('dark', {
        "& .comment-header": {
            backgroundColor: alpha(theme.palette[paletteColor].dark, .2),
            borderBottom: `1px solid ${theme.palette[paletteColor].main}`,
        },
        "& .comment-footer": {
            backgroundColor: alpha(theme.palette[paletteColor].dark, .2),
            borderTop: `1px solid ${theme.palette[paletteColor].main}`,
        },
    })
    ])
})

interface CommentInstanceProps {
    comment?: LeadComment,
    color?: string,
    isCreating?: boolean,
    onEdit?: () => void,
    onDelete?: () => void,
    footerContent?: ReactNode,
    title?: ReactNode,
    children: ReactNode
}

export const CommentInstance = ({ comment, title, color, footerContent, onEdit, onDelete, children }: CommentInstanceProps) => {

    return (
        <CommentNote color={comment?.color ?? color ?? "secondary"}>
            <Box className="comment-header" px={2}>
                <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
                <Stack direction="row">
                    {onEdit && <IconButton aria-label="edit" size="small" onClick={() => onEdit()} color="inherit">
                        <EditIcon fontSize="small" />
                    </IconButton>}
                    {onDelete && <IconButton aria-label="delete" size="small" onClick={() => onDelete()} color="inherit">
                        <CloseIcon fontSize="small" />
                    </IconButton>}
                </Stack>
            </Box>
            <Box className="comment-main" px={2} py={1.5}>
                {children}
            </Box>
            {footerContent &&
                <Box className="comment-footer" width="100%" gap={1} px={1} py={.25}>
                    {footerContent}
                </Box>
            }
        </CommentNote>
    )
}



export const Metadata = ({ comment }: { comment: LeadComment }) => {
    return (
        <>
            <Grid container gap={1} minWidth="15rem" size="grow" alignItems="center">
                <WatchLaterIcon />
                <Stack justifyContent="center">
                    <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Creado:</span> {dayjs(comment?.created_at).format("DD/MM/YYYY")}</Typography>
                    <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Por:</span> {comment?.created_by}</Typography>
                </Stack>
            </Grid>
            <Grid container gap={1} minWidth="15rem" size="grow" alignItems="center">
                <WatchLaterIcon />
                <Stack justifyContent="center">
                    <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Modificado:</span> {dayjs(comment?.created_at).format("DD/MM/YYYY")}</Typography>
                    {comment?.updated_by && <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Por:</span> {comment?.updated_by}</Typography>}
                </Stack>
            </Grid>
        </>)
}

const MetadataShort = ({ comment, isUser = false }: { comment: LeadComment, isUser?: boolean }) => {
    if (isUser) return (
        <Grid container gap={.5} alignItems="end">
            <PersonIcon fontSize="small" />
            <Typography variant="body2" fontWeight="bold">Por</Typography>
            <Typography variant="body2">{comment?.created_by ?? comment?.updated_by}</Typography>
        </Grid>
    )
    return (
        <Grid container gap={.5} alignItems="end" justifyContent="end" width="100%">
            <WatchLaterIcon fontSize="small" />
            <Typography variant="body2" textTransform="capitalize">
                {dayjs(comment?.updated_at ?? comment?.created_at).format("dddd DD/MM/YYYY HH:mm")}
            </Typography>
        </Grid>
    )
}