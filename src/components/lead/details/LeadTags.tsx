import { Button, Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListSubheader, Menu, Stack } from '@mui/material'
import type { LeadDetailed, LeadTag } from '../../../types/leads'
import { CustomChip } from '../../common/details/StyledDisplayComponents'
import { useEffect, useMemo, useState } from 'react'
import AddIcon from "@mui/icons-material/Add"
import type { Paginable } from '../../../types/common'
import { getTags, updateLeadTags } from './LeadDetailsService'
import { useListPagination } from '../../hooks/useListPagination'
import { PaginationComponent } from '../../common/lists/PaginationComponent'
import type { ColorTypes } from '../../../types/mui-theme.d'

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

    useEffect(() => {
        getTags({ only_active: true, page: fetchPage, page_size: pageSize })
            .then(setTagList)
    }, [fetchPage, pageSize])


    if (tags.length === 0) return (
        <>
            <Button sx={{ p: 0, minWidth: 0 }} size="small" onClick={openTagMenu}>
                <CustomChip color="primary" size='small' label={
                    <AddIcon fontSize='inherit' />
                } />
            </Button>
        </>
    )

    const handleTagUpdate = (tags: LeadTag[]) => {
        const leadCopy = { ...lead, tags: tags }
        updateLeadInfo(leadCopy)
    }

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
                <LeadTagsMenu leadId={lead.id} tags={tagList?.items} currentTags={tags} pageComponentProps={pageComponentProps}
                    menuAnchor={menuAnchor} handleClose={closeTagMenu} handleTagUpdate={handleTagUpdate} />
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
    handleTagUpdate: (tags: LeadTag[]) => void
}

const isHex = (color: string) => color.slice(0, 1) === "#"
const tagColor = (color: string) => isHex(color) ? "secondary" as ColorTypes : color as ColorTypes

const LeadTagsMenu = ({ leadId, tags, currentTags, menuAnchor, handleClose, pageComponentProps, handleTagUpdate }: TagsMenuProps) => {

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
            handleTagUpdate(res.tags)
            handleClose()
        })
    }

    return (
        <Menu
            id="basic-menu"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleClose}
        >
            <List sx={{
                maxHeight: "40rem", maxWidth: "30rem", overflowY: "auto"
            }}
                subheader={< ListSubheader sx={{ py: 0, backgroundColor: "transparent" }}>Lista de Tags</ListSubheader>}>
                {
                    tags.map(tag => (
                        <ListItem key={`list-${tag.id}`} sx={{ py: 0 }}
                        >
                            <ListItemButton onClick={() => handleToggle(tag.id)} sx={{ py: .5 }}>
                                <ListItemIcon>
                                    <Checkbox checked={selectedIds.includes(tag.id)}
                                        edge="start" sx={{ py: .5 }}
                                        onChange={() => handleToggle(tag.id)} />
                                </ListItemIcon>
                                <CustomChip color={tagColor(tag.color)} label={tag.name} />
                            </ListItemButton>
                        </ListItem>
                    ))
                }
            </List >
            <ListItem >
                <PaginationComponent {...pageComponentProps} />
            </ListItem>
            {isListChanged &&
                <Button onClick={handleSaveTags}>Guardar</Button>}
        </Menu >
    )
}
