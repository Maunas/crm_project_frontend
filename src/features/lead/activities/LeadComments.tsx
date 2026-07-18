import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { CreateCommentWrapper, UpdateCommentFromNote } from "./LeadCommentForm"
import { DisableConfirmDialog } from "src/components/ui/feedback/ConfirmationDialog"
import PaginationComponent from "shared/ui/lists/PaginationComponent"
import { OrderSearchMenu } from "shared/ui/lists/OrderMenu"
import { MetadataShort } from "shared/ui/details/DetailsMetadata"
import LoadingScreenWrapper from "src/components/ui/feedback/LoadingScreen"
import GenericPaper from "shared/layout/container/GenericPaper"
import { useListPagination } from "src/hooks/useListPagination"
import { useLoading } from "src/hooks/useLoading"
import { useOrderSeachList } from "src/hooks/useOrderSearchLists"
import type { LeadComment } from "src/types/leads"
import type { Paginable } from "src/types/shared"
import { deleteComment, getComments } from "./leadActivitiesService"
import { showCommonErrorToast, showToast } from "src/utils/feedback"
import { Box, Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material"
import { alpha, styled } from "@mui/material/styles"
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { getColorShades } from "src/utils/formatters"

const SEARCH_COMMENTS_FIELDS = [
    { name: "content", label: "Contenido" },
]

const SEARCH_BY_UPDATER_DEFAULT = [
    ...SEARCH_COMMENTS_FIELDS,
    { name: "updater_name", label: "Escritor", searchOptions: [] },
]

const ORDER_COMMENTS_FIELDS = [
    { name: "updated_by", label: "Escritor" },
]
export const LeadComments = ({ leadId }: { leadId: number }) => {

    const [comments, setComments] = useState<Paginable<LeadComment> | null>(null)
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)
    const { fetchPage, pageSize, pageComponentProps, goToPageOne } = useListPagination(comments, 12)
    const { fetchParams, handleOrderChange, handleSearchChange } = useOrderSeachList()

    const onOrderChange = useCallback((orderBy?: string, asc?: boolean, onlyActive?: boolean) => {
        handleOrderChange(orderBy, asc, onlyActive)
        goToPageOne()
    }, [handleOrderChange, goToPageOne])

    const onSearchChange = useCallback((search?: string, searchField?: string) => {
        handleSearchChange(search, searchField)
        goToPageOne()
    }, [handleSearchChange, goToPageOne])

    const fetchComments = useCallback(async (leadId: number, fetchPage: number, pageSize: number) => {
        if (!leadId) return
        return getComments({ detailed: true, lead_id: leadId, page: fetchPage, page_size: pageSize, ...fetchParams })
            .then(setComments)
            .catch(e => showCommonErrorToast(e))
    }, [fetchParams])

    const { fnWithLoading: fetchComLoad, loading } = useLoading(fetchComments)

    useEffect(() => {
        fetchComLoad(leadId, fetchPage, pageSize)
    }, [fetchComLoad, fetchPage, pageSize, leadId])

    const onDeleteComment = (delId: number) => {
        return deleteComment(delId)
            .then(() => {
                showToast("Comentario eliminado definitivamente.")
                fetchComments(leadId, fetchPage, pageSize)
            })
            .catch(e => showCommonErrorToast(e, "No se ha podido eliminar el comentario"))
    }
    const onCreateComment = () => {
        return fetchComments(leadId, fetchPage, pageSize)
    }
    const onUpdateCommentList = (newCom: LeadComment) => {
        const newComments = [...(comments?.items ?? [])]
        const commentListIdx = newComments.findIndex(listCom => listCom.id === newCom.id)
        if (commentListIdx === -1) return
        newComments[commentListIdx] = newCom
        setComments({ ...comments, items: newComments } as Paginable<LeadComment> | null)
        setSelectedCommentId(null)
    }

    const [deletingCom, setDeletingCom] = useState<LeadComment | null>(null)

    const searchOptions = useMemo(() => {
        if (!comments || comments?.items.length === 0) return SEARCH_BY_UPDATER_DEFAULT
        const users = new Map()
        //Busca a los usuarios que han escrito comentarios
        comments?.items.forEach((comment) => {
            const updater = comment.updater ?? comment.creator
            if (updater && !users.has(updater.id)) {
                users.set(updater.id, updater.name)
            }
        })
        return [
            ...SEARCH_COMMENTS_FIELDS,
            {
                name: "updater_name", label: "Escritor",
                searchOptions: Array.from(users.values())
                    .map((name) => ({ value: name, label: name }))
            }
        ]
    }, [comments])

    return (
        <Stack spacing={2} sx={{ height: "100%" }}>
            <OrderSearchMenu
                searchOptions={searchOptions}
                handleSearchChange={onSearchChange}
                orderOptions={ORDER_COMMENTS_FIELDS}
                handleOrderChange={onOrderChange}
            />
            <GenericPaper elevation={1} sx={{ flexGrow: 1 }} >
                <LoadingScreenWrapper loading={loading}>
                    <Stack spacing={2} sx={{
                        height: "100%", justifyContent: "space-between", alignItems: "end"
                    }}>
                        <Grid container spacing={2} sx={{
                            flex: 1, justifyContent: "end", alignItems: "start", alignContent: "start",
                            width: "100%", minWidth: "15rem"
                        }}>
                            {comments?.items.map(com =>
                                <Grid key={com.id} size="grow" sx={{ minWidth: "15rem", maxWidth: "35rem" }}>
                                    {com.id !== selectedCommentId ? (
                                        <CommentInstance comment={com} onEdit={() => setSelectedCommentId(com.id)}
                                            onDelete={() => setDeletingCom(com)} title={<MetadataShort metadata={com} onlyUser />}
                                            footerContent={<MetadataShort metadata={com} onlyDate containerProps={{ sx: { ml: "auto" } }} />} >
                                            {com.content}
                                        </CommentInstance>
                                    )
                                        : <UpdateCommentFromNote leadId={leadId} existingComment={com} onUpdate={onUpdateCommentList} onClose={() => setSelectedCommentId(null)} />
                                    }
                                </Grid>
                            )}
                        </Grid>
                        <PaginationComponent {...pageComponentProps} />
                    </Stack>
                </LoadingScreenWrapper>
            </GenericPaper>
            <Divider />
            <DisableConfirmDialog idModal="del-com" onConfirm={() => onDeleteComment(deletingCom!.id)} entity={deletingCom}
                clearEntity={() => setDeletingCom(null)} entityTypeName="el comentario" onlyDelete />
            <CreateCommentWrapper leadId={leadId} onCreate={onCreateComment} />
        </Stack >
    )
}

const CommentNote = styled(Paper)(({ theme, ...props }) => {

    const colorShades = getColorShades(props.color ?? "secondary", theme)

    return ([{
        borderRadius: "1rem 1rem 0 1rem",
        border: `1px solid ${colorShades.DARK}`,
        overflow: "hidden",
        color: theme.palette.text.primary,
        "& .comment-footer, .comment-header": {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
        },
        "& .comment-header": {
            backgroundColor: alpha(colorShades.LIGHT, .5),
            borderBottom: `1px solid ${colorShades.MAIN}`,
        },
        "& .comment-footer": {
            backgroundColor: alpha(colorShades.LIGHT, .5),
            borderTop: `1px solid ${colorShades.MAIN}`,
        },
        "& .comment-main": {
            minHeight: "3rem",
        },
    },
    theme.applyStyles('dark', {
        "& .comment-header": {
            backgroundColor: alpha(colorShades.DARK, .15),
            borderBottom: `1px solid ${colorShades.DARK}`,
        },
        "& .comment-footer": {
            backgroundColor: alpha(colorShades.DARK, .15),
            borderTop: `1px solid ${colorShades.DARK}`,
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
            <Box className="comment-header" sx={{ px: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>
                <Stack direction="row">
                    {onEdit && <IconButton aria-label="edit" size="small" onClick={() => onEdit()} color="inherit">
                        <EditIcon fontSize="small" />
                    </IconButton>}
                    {onDelete && <IconButton aria-label="delete" size="small" onClick={() => onDelete()} color="inherit">
                        <CloseIcon fontSize="small" />
                    </IconButton>}
                </Stack>
            </Box>
            <Box className="comment-main" sx={{ px: 2, py: 1.5 }}>
                {children}
            </Box>
            {footerContent &&
                <Box className="comment-footer" sx={{ px: 1, py: .5 }}>
                    {footerContent}
                </Box>
            }
        </CommentNote>
    )
}
