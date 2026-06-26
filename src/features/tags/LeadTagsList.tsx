import { useCallback, useEffect, useState } from 'react'
import { DisableConfirmDialog } from 'shared/feedback/ConfirmationDialog'
import PaginationComponent from 'shared/ui/lists/PaginationComponent'
import { ResponsiveListItem } from 'shared/ui/lists/CustomListItem'
import LoadingScreenWrapper from 'shared/feedback/LoadingScreen'
import GenericPaper from 'shared/layout/container/GenericPaper'
import CommonButton from 'shared/ui/buttons/CommonButton'
import { EnabledIcon } from 'shared/ui/lists/Icons'
import { useListPagination } from 'src/hooks/useListPagination'
import { useLoading } from 'src/hooks/useLoading'
import type { Paginable } from 'src/types/shared'
import { showCommonErrorToast, showToast } from 'src/utils/feedback'
import { Divider, Grid, ListItemText, Stack, Typography } from '@mui/material'
import type { LeadTagDetailed } from 'src/types/leads'
import { deleteTag, getTags } from './LeadTagService'
import { TagFormSidebarWrapper } from './LeadTagForm'

export const LeadTagsList = () => {

    const [tags, setTags] = useState<Paginable<LeadTagDetailed> | null>(null)

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(tags)

    const fetchTags = useCallback((fetchPage: number, pageSize: number) => {
        return getTags({
            detailed: true, only_active: false, page: fetchPage, page_size: pageSize
        })
            .then(setTags)
            .catch(e => showCommonErrorToast(e, "Error recuperando la lista de etiquetas"))
    }, [])

    const { fnWithLoading: fetchTagsLoad, loading } = useLoading(fetchTags)

    useEffect(() => {
        fetchTagsLoad(fetchPage, pageSize)
    }, [fetchTagsLoad, fetchPage, pageSize])

    const [editingTag, setEditingTag] = useState<LeadTagDetailed | null | undefined>(null)

    const updateList = useCallback((entity?: LeadTagDetailed, update: boolean = false) => {
        if (update) {
            if (!tags || !entity) return
            const tagsCopy = [...tags.items]
            const idx = tagsCopy.findIndex(tag => entity.id === tag.id)
            if (idx === -1) return
            tagsCopy[idx] = entity
            return setTags({ ...tags, items: tagsCopy })

        } else fetchTagsLoad(fetchPage, pageSize)
    }, [fetchPage, fetchTagsLoad, pageSize, tags])

    return (
        <Stack spacing={2}>
            <LoadingScreenWrapper loading={loading}>
                <Stack spacing={2}>
                    {(tags?.items && tags.items.length > 0) ?
                        <Stack spacing={2}>
                            <CommonButton actionType="CREATE" variant="contained" sx={{ alignSelf: "start" }}
                                onClick={() => setEditingTag(undefined)}>Agregar</CommonButton>
                            <LeadTagsListData tags={tags.items}
                                toggleUpdate={(tag: LeadTagDetailed) => setEditingTag(tag)}
                                updateList={updateList} />
                            <PaginationComponent {...pageComponentProps} />
                        </Stack>
                        :
                        <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center", height: "30rem" }}>
                            <Typography variant="h4">No se han encontrado etiquetas de lead...</Typography>
                            <CommonButton actionType="CREATE" variant="contained"
                                onClick={() => setEditingTag(undefined)}>Agregar</CommonButton>
                        </Stack>
                    }
                    {editingTag !== null &&
                        <>
                            <Divider />
                            <GenericPaper elevation={4} sx={{ px: 3, py: 2 }}>
                                <Stack spacing={2}>
                                    <TagFormSidebarWrapper existingTag={editingTag}
                                        onClose={() => setEditingTag(null)} onSubmit={updateList} />
                                </Stack>
                            </GenericPaper>
                        </>
                    }
                </Stack>
            </LoadingScreenWrapper >
        </Stack>
    )
}

interface LeadTagsListDataProps {
    tags: LeadTagDetailed[],
    toggleUpdate: (tag: LeadTagDetailed) => void,
    updateList: (entity?: LeadTagDetailed, update?: boolean) => void
}

export const LeadTagsListData = ({ tags, toggleUpdate, updateList }: LeadTagsListDataProps) => {

    const [deletingTag, setDeletingTag] = useState<LeadTagDetailed | null>(null)

    const handleDelete = useCallback((id: number) => {
        return deleteTag(id)
            .then(() => {
                showToast("Estado eliminado permanentemente.", "success")
                updateList()
            })
            .catch(e => { showCommonErrorToast(e, "Error eliminando la etiqueta.") })
    }, [updateList])

    return (
        <>
            <Grid container sx={{ marginInline: 1, alignItems: "stretch" }}>
                {tags.map((tag, idx) =>
                    <Grid key={`tag-${idx}`} size="grow" sx={{ minWidth: "15rem", minHeight: "100%" }}>
                        <ResponsiveListItem disablePadding sx={{ height: "100%" }}
                            onClick={() => toggleUpdate(tag)}
                            actions={[
                                { actionType: "MODIFY", label: "Editar", onClick: () => toggleUpdate(tag) },
                                {
                                    actionType: "DISABLE", color: "error", label: "Eliminar", onClick: () => setDeletingTag(tag)
                                }
                            ]}>
                            <ListItemText sx={{ mr: 4 }} primary={
                                <Stack spacing={1} direction="row" color="inherit" sx={{ width: "100%", alignItems: "center" }}>
                                    <EnabledIcon active={tag.active} />
                                    <Typography sx={{ fontWeight: "500" }} color="inherit">{tag.name}</Typography>
                                </Stack>
                            } />
                        </ResponsiveListItem>
                    </Grid>
                )}
            </Grid >
            {deletingTag &&
                <DisableConfirmDialog idModal='conf-delete-tag' entity={deletingTag} clearEntity={() => setDeletingTag(null)} entityTypeName="la etiqueta"
                    onConfirm={() => handleDelete(deletingTag?.id)} onlyDelete />
            }
        </>
    )
}
