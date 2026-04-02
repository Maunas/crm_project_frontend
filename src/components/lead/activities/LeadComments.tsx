import { useEffect, useState, type ReactNode } from "react"
import { PaginationComponent } from "../../common/lists/PaginationComponent"
import { CommentFromNote } from "./LeadCommentForm"
import type { Paginable } from "../../../types/common"
import type { LeadComment } from "../../../types/leads"
import { useListPagination } from "../../hooks/useListPagination"
import { deleteComment, getComments } from "./leadActivitiesService"
import dayjs from "dayjs"
import { Box, Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material"
import { alpha, styled } from "@mui/material/styles"
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import type { ColorTypes } from "../../../types/mui-theme.d"

export const LeadComments = ({ leadId }: { leadId: number }) => {

    const [comments, setComments] = useState<Paginable<LeadComment> | null>(null)
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)
    const { fetchPage, pageSize, pageComponentProps } = useListPagination(comments)

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

    return (
        <Stack spacing="1rem">
            <CommentFromNote leadId={leadId} onCreate={onCreateComment} />
            <Divider />
            <Grid container spacing={4}>
                {comments?.items.map(com =>
                    <Grid key={com.id} size="grow" minWidth="20rem">
                        {com.id !== selectedCommentId ? (
                            <CommentInstance comment={com} onEdit={() => setSelectedCommentId(com.id)}
                                onDelete={() => onDeleteComment(com.id)} title={<MetadataShort comment={com} />} >
                                {com.content}
                            </CommentInstance>
                        )
                            : (
                                <CommentFromNote leadId={leadId} existingComment={com} onUpdate={onUpdateComment} onClose={() => setSelectedCommentId(null)} />
                            )
                        }
                    </Grid>
                )}
            </Grid>
            <PaginationComponent {...pageComponentProps} />
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
            paddingInline: "1rem",
            backgroundColor: alpha(theme.palette[paletteColor].light, .5),
            borderBottom: `1px solid ${theme.palette[paletteColor].main}`,
        },
        "& .comment-footer": {
            gap: ".5rem",
            padding: ".25rem 1rem",
            backgroundColor: alpha(theme.palette[paletteColor].light, .5),
            borderTop: `1px solid ${theme.palette[paletteColor].main}`,
        },
        "& .comment-main": {
            padding: "1rem",
            minHeight: "4rem",
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

    return <CommentNote color={comment?.color ?? color ?? "secondary"}>
        <Box className="comment-header">
            <Typography variant="body1" fontWeight={600} >{title}</Typography>
            <Stack direction="row">
                {onEdit && <IconButton aria-label="edit" size="small" onClick={() => onEdit()} color="inherit">
                    <EditIcon fontSize="small" />
                </IconButton>}
                {onDelete && <IconButton aria-label="delete" size="small" onClick={() => onDelete()} color="inherit">
                    <CloseIcon fontSize="small" />
                </IconButton>}
            </Stack>
        </Box>
        <Box className="comment-main">
            {children}
        </Box>
        {footerContent &&
            <Box className="comment-footer" width="100%">
                {footerContent}
            </Box>
        }
    </CommentNote>
}



export const Metadata = ({ comment }: { comment: LeadComment }) => {
    return (
        <>
            <Grid container spacing=".5rem" minWidth="15rem" size="grow" alignItems="center">
                <WatchLaterIcon />
                <Stack justifyContent="center">
                    <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Creado:</span> {dayjs(comment?.created_at).format("DD/MM/YYYY")}</Typography>
                    <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Por:</span> {comment?.created_by}</Typography>
                </Stack>
            </Grid>
            <Grid container spacing=".5rem" minWidth="15rem" size="grow" alignItems="center">
                <WatchLaterIcon />
                <Stack justifyContent="center">
                    <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Modificado:</span> {dayjs(comment?.created_at).format("DD/MM/YYYY")}</Typography>
                    {comment?.updated_by && <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Por:</span> {comment?.updated_by}</Typography>}
                </Stack>
            </Grid>
        </>)
}

const MetadataShort = ({ comment }: { comment: LeadComment }) => {
    return (
        <Stack justifyContent="center" direction="row" spacing=".5rem">
            <Typography variant="body2"><span style={{ fontWeight: "bold" }}>Por</span> {comment?.created_by ?? comment?.updated_by} - </Typography>
            <Typography variant="body2" textTransform="capitalize"> {dayjs(comment?.updated_at ?? comment?.created_at).format("dddd DD/MM/YYYY HH:mm")}</Typography>
        </Stack>
    )
}