import { Box, Button, Checkbox, List, ListItem, ListItemButton, ListItemIcon, Popover, Stack, Typography, TextField, type PaletteColor, useTheme, IconButton, alpha } from '@mui/material'
import type { LeadDetailed, LeadTag, LeadTagPost } from '../../../types/leads'
import { CustomChip } from '../../common/details/StyledDisplayComponents'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AddIcon from "@mui/icons-material/Add"
import type { Paginable } from '../../../types/common'
import { createTag, getTags, updateLeadTags } from './LeadDetailsService'
import { useListPagination } from '../../hooks/useListPagination'
import { PaginationComponent } from '../../common/lists/PaginationComponent'
import type { ColorTypes } from '../../../types/mui-theme.d'
import { Controller, useForm, useWatch, type Control, type FieldValues, type Path } from 'react-hook-form'
import { FormErrorMessage } from '../../common/forms/StyledFormComponents'
import { COLORS, setFormErrors } from '../../../generalService'
import CircleIcon from '@mui/icons-material/Circle'

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

    const fetchTagChanges = () => fetchTags(fetchPage, pageSize)

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
                    menuAnchor={menuAnchor} handleClose={closeTagMenu} handleLeadTagUpdate={handleLeadTagUpdate} fetchTagChanges={fetchTagChanges} />
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
                <LeadTagsMenu leadId={lead.id} tags={tagList?.items} currentTags={tags} pageComponentProps={pageComponentProps}
                    menuAnchor={menuAnchor} handleClose={closeTagMenu} handleLeadTagUpdate={handleLeadTagUpdate} fetchTagChanges={fetchTagChanges} />
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
    fetchTagChanges: () => Promise<void>
}

const isHex = (color: string) => color.slice(0, 1) === "#"
const tagColor = (color: string) => isHex(color) ? "secondary" as ColorTypes : color as ColorTypes

const LeadTagsMenu = ({ leadId, tags, currentTags, menuAnchor, handleClose, pageComponentProps, handleLeadTagUpdate, fetchTagChanges }: TagsMenuProps) => {

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

    const handleFormAnchor = () => {
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
                    <List sx={{ maxHeight: "40rem", maxWidth: "30rem", overflowY: "auto" }} disablePadding>
                        {
                            tags.map(tag => (
                                <ListItem key={`list-${tag.id}`} sx={{ py: 0 }} disableGutters>
                                    <ListItemButton onClick={() => handleToggle(tag.id)} sx={{ py: .5 }}>
                                        <ListItemIcon>
                                            <Checkbox checked={selectedIds.includes(tag.id)}
                                                edge="start" sx={{ py: .5 }}
                                                onChange={() => handleToggle(tag.id)} />
                                        </ListItemIcon>
                                        <CustomChip color={tagColor(tag.color)} label={tag.name} sx={{ width: "100%" }} />
                                    </ListItemButton>
                                </ListItem>
                            ))
                        }
                    </List >
                    {pageComponentProps.totalPages > 1 &&
                        <PaginationComponent {...pageComponentProps} />}
                    <Stack spacing={.5} sx={{ width: "100%" }}>
                        <Button onClick={handleFormAnchor} fullWidth>Agregar Tag</Button>
                        {isListChanged &&
                            <Button onClick={handleSaveTags} variant='contained' fullWidth>Guardar</Button>
                        }
                    </Stack>
                </Stack>
            </Popover >
            <TagForm formAnchor={formAnchor} handleClose={() => setFormAnchor(null)} fetchTagChanges={fetchTagChanges} />
        </>
    )
}


interface TagFormProps {
    formAnchor: null | HTMLElement,
    handleClose: () => void,
    fetchTagChanges: () => Promise<void>,
}

const TagForm = ({ formAnchor, handleClose, fetchTagChanges }: TagFormProps) => {

    const { palette } = useTheme()

    const defaultValues = useMemo(() => ({
        name: "",
        color: "secondary"
    }), [])

    const { register, control, formState: { errors }, reset, handleSubmit, setError } = useForm<LeadTagPost>({
        defaultValues
    })

    const onPostTag = (data: LeadTagPost) => {
        createTag(data).then(() => {
            fetchTagChanges().then(() => {
                reset(defaultValues)
                handleClose()
            })
        }).catch(e => setFormErrors(e, setError))
    }

    const onCancel = () => {
        reset(defaultValues)
        handleClose()
    }

    const color = useWatch({ name: "color", control })

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
                <Typography variant="h4" component="h3">Crear Tag</Typography>
                <form onSubmit={handleSubmit(onPostTag)}>
                    <Stack spacing={1}>
                        <Stack spacing={.5}>
                            <TextField id="tag-name" label="Nombre" size="small" {...register("name")}
                                sx={{ backgroundColor: alpha(palette[color as ColorTypes].darker, .2) }} />
                            {errors?.name?.message && <FormErrorMessage>errors?.name?.message</FormErrorMessage>}
                        </Stack>
                        <ControlledColorPicker control={control} name="color" />
                        <Stack spacing={.5}>
                            <Button onClick={onCancel}>Cancelar</Button>
                            <Button variant="contained" type="submit">Crear</Button>
                        </Stack>
                    </Stack>
                </form>
            </Stack>
        </Popover >
    )
}

interface ColorSelectorProps<T extends FieldValues> {
    control: Control<T>,
    name: Path<T>
}

export const ControlledColorPicker = <T extends FieldValues>({ control, name }: ColorSelectorProps<T>) => {
    const { palette } = useTheme()
    return (
        <Controller control={control} name={name}
            render={({ field, fieldState }) => {
                return (
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={.5} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                            {COLORS.map(colorName => {
                                const paletteColor: PaletteColor = palette[colorName]
                                return (
                                    <IconButton size="small" key={colorName}
                                        onClick={() => {
                                            field.onChange(colorName)
                                        }}>
                                        <CircleIcon sx={{
                                            color: field.value === colorName ? paletteColor.main : paletteColor.light,
                                            borderRadius: "50%",
                                            border: field.value === colorName ? `2px solid ${palette.text.secondary}` : ""
                                        }} fontSize="small" />
                                    </IconButton>
                                )
                            })
                            }
                        </Stack>
                        {fieldState.error?.message && typeof fieldState.error?.message === "string" && (
                            <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
                        )}
                    </Stack>
                )
            }} />

    )
}
