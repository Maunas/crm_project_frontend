import { Box, Button, Checkbox, List, ListItem, ListItemButton, ListItemIcon, Popover, Stack, Typography, IconButton, ListItemText } from '@mui/material'
import type { LeadDetailed, LeadTag, LeadTagPost } from '../../../types/leads'
import { CustomChip } from '../../common/details/StyledDisplayComponents'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AddIcon from "@mui/icons-material/Add"
import type { Paginable } from '../../../types/common'
import { createTag, deleteTag, getTags, updateLeadTags, updateTag } from './LeadDetailsService'
import { useListPagination } from '../../hooks/useListPagination'
import { PaginationComponent } from '../../common/lists/PaginationComponent'
import type { ColorTypes } from '../../../types/mui-theme.d'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import { LeadTagForm } from './LeadTagForm'

export const LeadTags = ({ lead, tags, updateLeadInfo }: { lead: LeadDetailed, tags: LeadTag[], updateLeadInfo: (lead: LeadDetailed) => void }) => {
    const [open, setOpen] = useState<boolean>(false)

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const openTagMenu = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setOpen(true)
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
    }, [])

    useEffect(() => {
        fetchTags(fetchPage, pageSize)
    }, [fetchTags, fetchPage, pageSize])

    const handleTagsUpdate = (modifiedTag?: LeadTag) => {
        if (modifiedTag) {
            const oldTags = [...lead.tags]
            const modTagIdx = oldTags.findIndex(oldTag => oldTag.id === modifiedTag.id)
            if (modTagIdx === -1) return
            oldTags[modTagIdx] = modifiedTag
            handleLeadTagUpdate(oldTags)
        }
        fetchTags(fetchPage, pageSize)
    }

    const handleDeleteTag = (deletedTag: LeadTag) => {
        deleteTag(deletedTag.id)
            .then(() => {
                const oldTags = [...lead.tags]
                const newTags = oldTags.filter(oldTag => oldTag.id !== deletedTag.id)
                handleLeadTagUpdate(newTags)
                fetchTags(fetchPage, pageSize)
            })
    }

    const handleLeadTagUpdate = (tags: LeadTag[]) => {
        const leadCopy = { ...lead, tags: tags }
        updateLeadInfo(leadCopy)
    }

    if (tags.length === 0) return (
        <Box sx={{ width: "100%" }}>
            <Button sx={{ p: 0, minWidth: 0 }} size="small" onClick={openTagMenu}>
                <CustomChip color="primary" size='small' label={
                    <AddIcon fontSize='inherit' />
                } />
            </Button>
            {tagList &&
                <LeadTagsMenu leadId={lead.id} tags={tagList?.items} currentTags={tags} pageComponentProps={pageComponentProps}
                    menuAnchor={menuAnchor} handleClose={closeTagMenu}
                    handleLeadTagUpdate={handleLeadTagUpdate} handleTagsUpdate={handleTagsUpdate} handleDeleteTag={handleDeleteTag} />
            }
        </Box>
    )

    return (
        <>
            <Stack direction="row" spacing={.5} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center", justifyContent: "start", width: "100%" }}>
                {tags.map(tag =>
                    <Button sx={{ p: 0, minWidth: 0 }} size="small" key={`lead-${tag.id}`} onClick={() => setOpen(p => !p)}>
                        <CustomChip size='small' color={tag.color} defaultColor="secondary" label={tag.name}
                            sx={{
                                maxHeight: open ? "5rem" : ".5rem", maxWidth: open ? "10rem" : "3rem",
                                transition: `all 150ms ease-in-out ${open ? "0ms" : "100ms"}`,
                                "& .MuiChip-label": {
                                    opacity: open ? 1 : 0,
                                    transition: `opacity 200ms ease-in-out ${open ? "150ms" : "0ms"}`,
                                }
                            }}
                        />
                    </Button>
                )}
                <Button sx={{ p: 0, minWidth: 0 }} size="small" onClick={openTagMenu}>
                    <CustomChip color="primary" size='small' label={<AddIcon fontSize='inherit' />}
                        sx={{
                            maxHeight: open ? "5rem" : "0", maxWidth: open ? "10rem" : "0", opacity: open ? 1 : 0,
                            transition: `all 150ms ease-in-out ${open ? "150ms" : "0ms"}`,
                        }} />
                </Button>
            </Stack>
            {tagList &&
                <LeadTagsMenu leadId={lead.id} tags={tagList?.items} currentTags={tags} pageComponentProps={pageComponentProps} handleDeleteTag={handleDeleteTag}
                    menuAnchor={menuAnchor} handleClose={closeTagMenu} handleLeadTagUpdate={handleLeadTagUpdate} handleTagsUpdate={handleTagsUpdate} />
            }

        </>
    )
}

interface TagsMenuProps {
    leadId: number,
    tags: LeadTag[],
    currentTags: LeadTag[],
    menuAnchor: null | HTMLElement,
    handleClose: () => void,
    pageComponentProps: {
        totalPages: number;
        page: number;
        handlePage: (_: React.ChangeEvent<unknown, Element>, value: number) => void;
    },
    handleLeadTagUpdate: (tags: LeadTag[]) => void,
    handleTagsUpdate: (modifiedTag?: LeadTag) => void
    handleDeleteTag: (deletedTag: LeadTag) => void
}

const isHex = (color: string) => color.slice(0, 1) === "#"
const tagColor = (color: string) => isHex(color) ? "secondary" as ColorTypes : color as ColorTypes

const LeadTagsMenu = ({ leadId, tags, currentTags, menuAnchor, handleClose, pageComponentProps, handleLeadTagUpdate, handleTagsUpdate, handleDeleteTag }: TagsMenuProps) => {

    const originalSelectedIds = useMemo(() => currentTags.map(tag => tag.id), [currentTags])

    const [selectedIds, setSelectedIds] = useState<number[]>(originalSelectedIds)

    const isListChanged = useMemo(() =>
        JSON.stringify(originalSelectedIds) !== JSON.stringify(selectedIds),
        [originalSelectedIds, selectedIds])

    const handleToggle = (id: number) => {
        const idx = selectedIds.findIndex(sel => sel === id)
        const idsCopy = [...selectedIds]
        if (idx !== -1) {
            idsCopy.splice(idx, 1)
        } else {
            idsCopy.splice(idx, 0, id)
        }
        setSelectedIds(idsCopy)
    }

    const handleSaveTags = () => {
        updateLeadTags(selectedIds, leadId).then(res => {
            handleLeadTagUpdate(res.tags)
            handleClose()
        })
    }

    const [formAnchor, setFormAnchor] = useState<null | HTMLElement>(null);

    const menuRef = useRef(null)

    const handleCreateTag = () => {
        setEditTag(null)
        setFormAnchor(menuRef.current)
    }

    const [editTag, setEditTag] = useState<null | LeadTag>(null)
    const handleEditTag = (tag: LeadTag) => {
        setEditTag(tag)
        setFormAnchor(menuRef.current)
    }
    return (
        <>
            <Popover
                disableScrollLock
                disableAutoFocus
                id="basic-menu"
                anchorEl={menuAnchor}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                open={Boolean(menuAnchor)}
                onClose={handleClose}
            >
                <Stack spacing={1} sx={{ p: 2 }} ref={menuRef}>
                    <Typography variant="h4" component="h3">Asignar Tags</Typography>
                    <List sx={{ maxHeight: "30rem", maxWidth: "25rem", overflowY: "auto" }} >
                        {
                            tags.map(tag => (
                                <ListItem key={`list-${tag.id}`} disablePadding
                                    secondaryAction={
                                        <Stack direction="row" sx={{ mr: -1 }}>
                                            <IconButton title="Modificar" edge="end" size='small' onClick={() => handleEditTag(tag)}><EditIcon fontSize='small' /></IconButton>
                                            <IconButton title="Eliminar" edge="end" size='small' onClick={() => handleDeleteTag(tag)}><CloseIcon color='error' fontSize='small' /></IconButton>
                                        </Stack>
                                    }
                                >
                                    <ListItemButton onClick={() => handleToggle(tag.id)} sx={{ py: .5 }}>
                                        <ListItemIcon>
                                            <Checkbox checked={selectedIds.includes(tag.id)} disableRipple
                                                edge="start" sx={{ py: .5 }} onChange={() => handleToggle(tag.id)} />
                                        </ListItemIcon>
                                        <ListItemText sx={{ my: 0, mr: 3 }} primary={
                                            <CustomChip color={tagColor(tag.color)} label={tag.name} sx={{ width: "100%" }} />
                                        } />
                                    </ListItemButton>
                                </ListItem>
                            ))
                        }
                    </List >
                    {
                        pageComponentProps.totalPages > 1 &&
                        <PaginationComponent {...pageComponentProps} />
                    }
                    < Stack spacing={.5} sx={{ width: "100%" }
                    }>
                        <Button onClick={handleCreateTag} fullWidth>Agregar Tag</Button>
                        {
                            isListChanged &&
                            <Button onClick={handleSaveTags} variant='contained' fullWidth>Guardar</Button>
                        }
                    </Stack >
                </Stack >
            </Popover >
            <TagFormMenuWrapper formAnchor={formAnchor} handleClose={() => setFormAnchor(null)} handleTagsUpdate={handleTagsUpdate} existingTag={editTag} />
        </>
    )
}


interface TagFormMenuProps {
    formAnchor: null | HTMLElement,
    handleClose: () => void,
    handleTagsUpdate: (modifiedTag?: LeadTag | undefined) => void,
    existingTag: LeadTag | null
}

export const TagFormMenuWrapper = ({ existingTag, formAnchor, handleClose, handleTagsUpdate }: TagFormMenuProps) => {

    const onPostTag = (data: LeadTagPost) => {
        if (existingTag) {
            return updateTag(data, existingTag.id)
                .then(res => {
                    handleTagsUpdate(res)
                    handleClose()
                })
        }
        return createTag(data)
            .then(() => {
                handleTagsUpdate()
                handleClose()
            })
    }

    return (
        <Popover
            disableScrollLock
            disableAutoFocus
            id="basic-menu"
            anchorEl={formAnchor}
            open={Boolean(formAnchor)}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <Stack spacing={2} sx={{ p: 2 }}>
                <Typography variant="h4" component="h3">{existingTag ? "Modificar Tag" : "Crear Tag"}</Typography>
                <LeadTagForm existingTag={existingTag} onCancel={handleClose} onSubmit={onPostTag} />
            </Stack>
        </Popover >
    )
}