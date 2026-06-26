import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TagFormMenuWrapper } from './LeadTagForm'
import { DisableConfirmDialog } from 'shared/feedback/ConfirmationDialog'
import { CommonIconButton } from 'shared/ui/buttons/CommonIconButton'
import PaginationComponent from 'shared/ui/lists/PaginationComponent'
import LoadingScreenWrapper from 'shared/feedback/LoadingScreen'
import { CustomListItem } from 'shared/ui/lists/CustomListItem'
import CommonButton from 'shared/ui/buttons/CommonButton'
import CustomChip from 'shared/ui/details/CustomChip'
import { useListPagination } from 'src/hooks/useListPagination'
import { useLoading } from 'src/hooks/useLoading'
import type { LeadDetailed, LeadTag, LeadTagDetailed } from 'src/types/leads'
import type { Paginable } from 'src/types/shared'
import { deleteTag, getTags, updateLeadTags } from '../lead/details/LeadDetailsService'
import { showCommonErrorToast, showToast } from 'src/utils/feedback'
import { Box, Button, Checkbox, List, ListItemButton, ListItemIcon, Popover, Stack, Typography, ListItemText, ButtonGroup } from '@mui/material'
import AddIcon from "@mui/icons-material/Add"

export const LeadTags = ({ lead, updateLeadInfo }: { lead: LeadDetailed, updateLeadInfo: (lead: LeadDetailed) => void }) => {

    const [openList, setOpenList] = useState<boolean>(false)

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const openTagMenu = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setOpenList(true)
        setMenuAnchor(e.currentTarget)
    }
    const closeTagMenu = () => {
        setMenuAnchor(null)
    }
    const [tagList, setTagList] = useState<Paginable<LeadTag> | null>(null)

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(tagList, 8)

    const fetchTags = useCallback((fetchPage: number, pageSize: number) => {
        return getTags({ only_active: true, page: fetchPage, page_size: pageSize })
            .then(setTagList)
            .catch(e => showCommonErrorToast(e))
    }, [])

    const { fnWithLoading: fetchTagsLoad, loading } = useLoading(fetchTags)

    useEffect(() => {
        fetchTagsLoad(fetchPage, pageSize)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchPage, pageSize])

    /** Actualiza la entidad lead, con sus nuevos tags */
    const handleLeadTagUpdate = (tags: LeadTag[]) => {
        const leadCopy = { ...lead, tags: tags }
        updateLeadInfo(leadCopy)
    }
    /** Actualiza la lista de tags de la organización */
    const handleTagListUpdate = (modifiedTag: LeadTag) => {
        if (!tagList) return
        const oldTags = [...tagList.items]
        const modTagIdx = oldTags.findIndex(oldTag => oldTag.id === modifiedTag.id)
        if (modTagIdx === -1) return
        oldTags[modTagIdx] = modifiedTag
        setTagList({ ...tagList, items: oldTags })
    }
    /** Actualiza la lista de tags del lead  */
    const handleLeadTagsUpdate = (modifiedTag: LeadTag) => {
        const oldTags = [...lead.tags]
        const modTagIdx = oldTags.findIndex(oldTag => oldTag.id === modifiedTag.id)
        if (modTagIdx === -1) return
        oldTags[modTagIdx] = modifiedTag
        handleLeadTagUpdate(oldTags)
    }
    /** Actualiza las listas según si modifica o crea un tag */
    const handleTagsUpdate = (modifiedTag?: LeadTag) => {
        if (!modifiedTag) return fetchTagsLoad(fetchPage, pageSize)
        handleTagListUpdate(modifiedTag)
        handleLeadTagsUpdate(modifiedTag)
    }
    /** Actualiza las listas cuando se elimina un tag */
    const handleDeleteTag = (deletedTag: LeadTag) => {
        const oldTags = [...lead.tags]
        const newTags = oldTags.filter(oldTag => oldTag.id !== deletedTag.id)
        handleLeadTagUpdate(newTags)
        return fetchTagsLoad(fetchPage, pageSize)
    }

    return (<>
        {(lead.tags.length === 0) ? (
            <Box sx={{ width: "100%" }}>
                <Button sx={{ p: 0, minWidth: 0 }} size="small" onClick={openTagMenu}>
                    <CustomChip chipColor="primary" size='small' label={
                        <AddIcon fontSize='inherit' />
                    } />
                </Button>
            </Box>
        ) : (
            <>
                <Stack direction="row" spacing={.5} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center", justifyContent: "start", width: "100%" }}>
                    {lead.tags.map(tag =>
                        <Button sx={{ p: 0, minWidth: 0 }} size="small" key={`lead-${tag.id}`} onClick={() => setOpenList(p => !p)}>
                            <CustomChip size='small' chipColor={tag.color} defaultColor="secondary" label={tag.name}
                                sx={{
                                    maxHeight: openList ? "5rem" : ".5rem", maxWidth: openList ? "10rem" : "3rem",
                                    transition: `all 150ms ease-in-out ${openList ? "0ms" : "100ms"}`,
                                    "& .MuiChip-label": {
                                        opacity: openList ? 1 : 0,
                                        transition: `opacity 200ms ease-in-out ${openList ? "150ms" : "0ms"}`,
                                    }
                                }} />
                        </Button>
                    )}
                    <Button sx={{ p: 0, minWidth: 0 }} size="small" onClick={openTagMenu}>
                        <CustomChip chipColor="primary" size='small' label={<Stack direction="row" spacing={.5}><AddIcon fontSize='inherit' />{lead.tags.length === 0 && "Etiquetas"}</Stack>}
                            sx={{
                                maxHeight: "5rem", maxWidth: "10rem", display: openList ? "flex" : "none",
                                transition: `all 150ms ease-in-out ${openList ? "150ms" : "0ms"}`,
                            }} />
                    </Button>
                </Stack>
            </>
        )}
        <LeadTagsMenu leadId={lead.id} tagList={tagList?.items} leadTags={lead.tags} pageComponentProps={pageComponentProps}
            menuAnchor={menuAnchor} handleClose={closeTagMenu} loadingList={loading}
            handleLeadTagUpdate={handleLeadTagUpdate} handleTagsUpdate={handleTagsUpdate} handleDeleteTag={handleDeleteTag} />
    </>)

}

interface TagsMenuProps {
    leadId: number,
    tagList?: LeadTag[],
    leadTags: LeadTag[],
    menuAnchor: null | HTMLElement,
    handleClose: () => void,
    pageComponentProps: {
        totalPages: number;
        page: number;
        handlePage: (_: React.ChangeEvent<unknown, Element>, value: number) => void;
    },
    handleLeadTagUpdate: (tags: LeadTag[]) => void,
    handleTagsUpdate: (modifiedTag?: LeadTag) => void
    handleDeleteTag: (deletedTag: LeadTag) => Promise<unknown>,
    loadingList?: boolean
}
const LeadTagsMenu = ({ leadId, tagList, leadTags, menuAnchor, handleClose, pageComponentProps,
    handleLeadTagUpdate, handleTagsUpdate, handleDeleteTag, loadingList = false }: TagsMenuProps) => {

    const originalSelectedIds = useMemo(() => leadTags.map(tag => tag.id), [leadTags])

    const [selectedIds, setSelectedIds] = useState<number[]>(originalSelectedIds)

    const isListChanged = useMemo(() =>
        JSON.stringify(originalSelectedIds) !== JSON.stringify(selectedIds),
        [originalSelectedIds, selectedIds])

    const handleCheckboxToggle = (id: number) => {
        const idx = selectedIds.findIndex(sel => sel === id)
        const idsCopy = [...selectedIds]
        if (idx === -1) {
            idsCopy.splice(idx, 0, id) //Agrega
        } else {
            idsCopy.splice(idx, 1) //Elimina
        }
        setSelectedIds(idsCopy)
    }

    const onSaveTags = () => {
        return updateLeadTags(selectedIds, leadId)
            .then(res => {
                showToast("Etiquetas del lead actualizadas con éxito")
                handleLeadTagUpdate(res.tags)
                handleClose()
            })
            .catch(e => showCommonErrorToast(e))
    }

    const { fnWithLoading: saveTagsLoad, loading: loadingSave } = useLoading(onSaveTags)

    const [formAnchor, setFormAnchor] = useState<null | HTMLElement>(null);

    const menuRef = useRef(null)

    const [editTag, setEditTag] = useState<null | LeadTag>(null)

    const toggleCreateTag = () => {
        setEditTag(null)
        setFormAnchor(menuRef.current)
    }
    const toggleEditTag = (tag: LeadTag) => {
        setEditTag(tag)
        setFormAnchor(menuRef.current)
    }

    const onDeleteTag = async (tag: LeadTag | null) => {
        if (!tag) return
        return deleteTag(tag.id).then(() => {
            handleDeleteTag(tag).then(() => {
                showToast(`Etiqueta "${tag.name}" eliminada definitivamente`)
            })
        })
    }
    const [deletingTag, setDeletingTag] = useState<LeadTagDetailed | null>(null)

    const handleSetDeletingTag = (tag: LeadTag) => {
        setDeletingTag({ ...tag, active: true } as LeadTagDetailed)
    }

    return (
        <>
            <Popover disableScrollLock disableAutoFocus id="tags-menu" elevation={3}
                anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Stack ref={menuRef} spacing={1} useFlexGap sx={{ p: 1 }}>
                    <Typography variant="h4" component="h3" sx={{ pt: 1, px: 1 }}>Asignar Etiquetas</Typography>
                    <LoadingScreenWrapper loading={loadingList} sx={{ width: "15rem", height: "10rem" }}>
                        <List sx={{ maxHeight: "30rem", minWidth: "15rem", maxWidth: "25rem", overflowY: "auto" }} dense >
                            {
                                tagList?.map(tag => (
                                    <CustomListItem key={`list-${tag.id}`} disablePadding
                                        secondaryAction={
                                            <Stack direction="row" sx={{ mr: -1 }}>
                                                <CommonIconButton title="Modificar" actionType='MODIFY'
                                                    size='small' tooltipSize="small" onClick={() => toggleEditTag(tag)} />
                                                <CommonIconButton title="Eliminar" actionType='CLOSE'
                                                    color="error" size='small' tooltipSize="small" onClick={() => handleSetDeletingTag(tag)} />
                                            </Stack>
                                        }
                                    >
                                        <ListItemButton onClick={() => handleCheckboxToggle(tag.id)} sx={{ py: .25 }}>
                                            <ListItemIcon>
                                                <Checkbox checked={selectedIds.includes(tag.id)} disableRipple
                                                    edge="start" sx={{ py: 0 }} onChange={() => handleCheckboxToggle(tag.id)} />
                                            </ListItemIcon>
                                            <ListItemText sx={{ my: 0, mr: 3 }} primary={
                                                <CustomChip chipColor={tag.color} label={tag.name} sx={{ width: "100%" }} />
                                            } />
                                        </ListItemButton>
                                    </CustomListItem>
                                ))
                            }
                        </List >
                        {pageComponentProps.totalPages > 1 &&
                            <PaginationComponent {...pageComponentProps} />
                        }
                    </LoadingScreenWrapper>
                    <ButtonGroup fullWidth>
                        <CommonButton actionType='CREATE' onClick={toggleCreateTag} variant='outlined' fullWidth disabled={loadingSave}>
                            Agregar
                        </CommonButton>
                        {isListChanged &&
                            <CommonButton actionType='SAVE' onClick={saveTagsLoad} variant='contained' fullWidth loading={loadingSave}>
                                Guardar
                            </CommonButton>
                        }
                    </ButtonGroup >
                </Stack >
            </Popover >
            <TagFormMenuWrapper formAnchor={formAnchor} handleClose={() => setFormAnchor(null)} handleTagsUpdate={handleTagsUpdate} existingTag={editTag} />
            <DisableConfirmDialog entity={deletingTag} clearEntity={() => setDeletingTag(null)} idModal='del-tag'
                onConfirm={() => onDeleteTag(deletingTag)} entityTypeName="la etiqueta" onlyDelete />
        </>
    )
}

