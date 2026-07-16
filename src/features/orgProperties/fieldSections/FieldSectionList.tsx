import { useCallback, useEffect, useState } from 'react'
import { DisableConfirmDialog } from 'src/components/ui/feedback/ConfirmationDialog'
import PaginationComponent from 'shared/ui/lists/PaginationComponent'
import { ResponsiveListItem } from 'shared/ui/lists/CustomListItem'
import LoadingScreenWrapper from 'src/components/ui/feedback/LoadingScreen'
import GenericPaper from 'shared/layout/container/GenericPaper'
import CommonButton from 'shared/ui/buttons/CommonButton'
import { EnabledIcon } from 'shared/ui/lists/Icons'
import { useListPagination } from 'src/hooks/useListPagination'
import { useLoading } from 'src/hooks/useLoading'
import type { Paginable } from 'src/types/shared'
import { showCommonErrorToast, showToast } from 'src/utils/feedback'
import { Divider, Grid, ListItemText, Stack, Typography } from '@mui/material'
import type { LeadFieldSectionDetailed } from 'src/types/orgProperties'
import { disableFieldSection, enableFieldSection, getFieldSections } from './fieldSectionsServices'
import { FieldSectionForm } from './FieldSectionForm'

export const FieldSectionList = () => {

    const [sections, setSections] = useState<Paginable<LeadFieldSectionDetailed> | null>(null)

    const { fetchPage, pageSize, pageComponentProps } = useListPagination(sections)

    const fetchSections = useCallback((fetchPage: number, pageSize: number) => {
        return getFieldSections({
            detailed: true, only_active: false, page: fetchPage, page_size: pageSize
        })
            .then(setSections)
            .catch(e => showCommonErrorToast(e, "Error recuperando la lista de secciones"))
    }, [])

    const { fnWithLoading: fetchSectionsLoad, loading } = useLoading(fetchSections)

    useEffect(() => {
        fetchSectionsLoad(fetchPage, pageSize)
    }, [fetchSectionsLoad, fetchPage, pageSize])

    const [editingSection, setEditingSection] = useState<LeadFieldSectionDetailed | null | undefined>(null)

    const updateList = useCallback((entity?: LeadFieldSectionDetailed, update: boolean = false) => {
        if (update) {
            if (!sections || !entity) return
            const sectionsCopy = [...sections.items]
            const idx = sectionsCopy.findIndex(section => entity.id === section.id)
            if (idx === -1) return
            sectionsCopy[idx] = entity
            return setSections({ ...sections, items: sectionsCopy })

        } else fetchSectionsLoad(fetchPage, pageSize)
    }, [fetchPage, fetchSectionsLoad, pageSize, sections])

    return (
        <Stack spacing={2}>
            <LoadingScreenWrapper loading={loading}>
                <Stack spacing={2}>
                    {(sections?.items && sections.items.length > 0) ?
                        <Stack spacing={2}>
                            <CommonButton actionType="CREATE" variant="contained" sx={{ alignSelf: "start" }}
                                onClick={() => setEditingSection(undefined)}>Agregar</CommonButton>
                            <FieldSectionListData sections={sections.items}
                                toggleUpdate={(state: LeadFieldSectionDetailed) => setEditingSection(state)}
                                updateList={updateList} />
                            <PaginationComponent {...pageComponentProps} />
                        </Stack>
                        :
                        <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center", height: "30rem" }}>
                            <Typography variant="h4">No se han encontrado secciones de campo...</Typography>
                            <CommonButton actionType="CREATE" variant="contained"
                                onClick={() => setEditingSection(undefined)}>Agregar</CommonButton>
                        </Stack>
                    }
                    {editingSection !== null &&
                        <>
                            <Divider />
                            <GenericPaper elevation={4} sx={{ px: 3, py: 2 }}>
                                <FieldSectionForm existingSection={editingSection}
                                    onClose={() => setEditingSection(null)} onSubmit={updateList} />
                            </GenericPaper>
                        </>
                    }
                </Stack>
            </LoadingScreenWrapper >
        </Stack>
    )
}

interface FieldSectionListDataProps {
    sections: LeadFieldSectionDetailed[],
    toggleUpdate: (state: LeadFieldSectionDetailed) => void,
    updateList: (entity?: LeadFieldSectionDetailed, update?: boolean) => void
}

const FieldSectionListData = ({ sections, toggleUpdate, updateList }: FieldSectionListDataProps) => {

    const [disableSection, setDisableSection] = useState<LeadFieldSectionDetailed | null>(null)

    const handleEnableDisable = useCallback((id: number, isActive: boolean) => {
        if (!isActive) {
            return enableFieldSection(id)
                .then(() => {
                    showToast("Sección habilitada correctamente.", "success")
                    updateList()
                })
                .catch(e => { showCommonErrorToast(e, "Error habilitando la sección.") })
        }
        return disableFieldSection(id)
            .then(res => {
                if (res.action === "disabled") showToast("Sección deshabilitada correctamente.", "success")
                else showToast("Sección eliminada permanentemente.", "success")
                updateList()
            })
            .catch(e => { showCommonErrorToast(e, "Error deshabilitando la sección.") })
    }, [updateList])

    return (
        <>
            <Grid container sx={{ marginInline: 1, alignItems: "stretch" }}>
                {sections.map((section, idx) =>
                    <Grid key={`section-${idx}`} size="grow" sx={{ minWidth: "15rem", minHeight: "100%" }}>
                        <ResponsiveListItem disablePadding sx={{ height: "100%" }}
                            onClick={() => toggleUpdate(section)}
                            actions={[
                                { template: "MODIFY", onClick: () => toggleUpdate(section) },
                                { template: section.active ? "DISABLE" : "ENABLE", onClick: () => setDisableSection(section) },
                            ]}>
                            <ListItemText sx={{ mr: 4 }} primary={
                                <Stack spacing={1} direction="row" color="inherit" sx={{ width: "100%", alignItems: "center" }}>
                                    <EnabledIcon active={section.active} />
                                    <Typography sx={{ fontWeight: "500" }} color="inherit">{section.name}</Typography>
                                </Stack>
                            } />
                        </ResponsiveListItem>
                    </Grid>
                )}
            </Grid >
            {disableSection &&
                <DisableConfirmDialog idModal='conf-delete-contact' entity={disableSection} clearEntity={() => setDisableSection(null)} entityTypeName="la sección"
                    onConfirm={() => handleEnableDisable(disableSection?.id, disableSection?.active)} />
            }
        </>
    )
}
