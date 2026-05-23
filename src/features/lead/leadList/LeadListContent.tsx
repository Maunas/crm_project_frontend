
import { memo, useMemo } from "react"
import { LeadTablePresentation } from "./LeadTablePresentation"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useDragAndDrop } from "src/hooks/useDragAndDrop"
import type { LeadField } from "src/types/leadFields"
import type { Lead } from "src/types/leads"
import { Link } from "react-router-dom"
import { Stack, Typography, ButtonGroup, Badge } from "@mui/material"

interface LeadListContentProps {
    leads: Lead[],
    leadFields: LeadField[],
    selectedFieldIds: number[],
    activeFilters: number,
    modalProps: {
        openModalId?: string;
        handleOpen: (idModal: string) => void;
        handleClose: () => void;
    },
    orderProps: {
        orderBy: string | number | null;
        ascending: boolean;
        handleOrderList: (field: string | number | null) => void;
    },
    handleSelectedFieldIds: (ids: number[], closeModal?: boolean) => void,
    selectCheckboxProps: {
        checkedItems: Map<number, Lead>;
        addItem: (item: Lead | Lead[]) => void;
        removeItem: (item: Lead) => void;
        removeAllItems: () => void;
    },
    presentationMode: string
}

/**
 * Wrapper del contenido, realiza la lógica de selectedColumns, y elige el modo de vista deseado.
 */
export const LeadListContent = memo(({ leads, leadFields, selectedFieldIds, activeFilters = 0, modalProps, orderProps, handleSelectedFieldIds,
    selectCheckboxProps, presentationMode }: LeadListContentProps) => {

    //Filtra los objetos LeadField para seguir el orden del arreglo de ids.
    const selectedColumns = useMemo(() => {
        if (!leadFields || leadFields.length === 0) return []
        if (!selectedFieldIds || selectedFieldIds.length === 0) return []
        return leadFields.filter(leadField => selectedFieldIds.includes(leadField.id))
            .sort((a, b) => selectedFieldIds.indexOf(a.id) - selectedFieldIds.indexOf(b.id))
    }, [leadFields, selectedFieldIds])

    //Da los estilos y funcionalidad del drag and drop de columnas, a través de sus ids.
    const dragProps = useDragAndDrop(selectedFieldIds, (items) => handleSelectedFieldIds(items))

    if (leads.length === 0) return (
        <Stack spacing={3} sx={{ my: 3, alignItems: "center" }}>
            <Stack spacing={2} sx={{ alignItems: "center" }}>
                <Typography variant="h3">No hay leads para presentar</Typography>
                <Typography variant="h4">Agrega un lead nuevo{activeFilters > 0 && " o revisa los filtros activos"}</Typography>
            </Stack>
            <ButtonGroup >
                <CommonButton actionType="CREATE" color="primary" component={Link} to="/leads/new">
                    Agregar Lead
                </CommonButton>
                {activeFilters > 0 &&
                    <Badge badgeContent={activeFilters} color="success">
                        <CommonButton actionType="FILTER" color="secondary" onClick={() => modalProps.handleOpen("lead_filters")}>
                            Aplicar Filtros
                        </CommonButton>
                    </Badge>
                }
            </ButtonGroup>
        </Stack>
    )

    //Si hay leads, pero no hay columnas seleccionadas
    if (selectedColumns && selectedColumns?.length === 0) return (
        <Stack spacing={3} sx={{ my: 3, alignItems: "center" }}>
            <Stack spacing={2} sx={{ alignItems: "center" }}>
                <Typography variant="h3">No hay datos para presentar.</Typography>
                <Typography variant="h4">Revisa los campos seleccionados.</Typography>
            </Stack>
            <CommonButton actionType="OPTIONS" color="secondary" onClick={() => modalProps.handleOpen("columns_selector")}>
                Modificar Campos
            </CommonButton>
        </Stack>
    )

    switch (presentationMode) {
        case "LIST": return <p>Lista</p>
        case "GRID": return <p>Grid</p>
        default: return <LeadTablePresentation leads={leads} selectedColumns={selectedColumns}
            dragProps={dragProps} orderProps={orderProps} modalProps={modalProps} selectCheckboxProps={selectCheckboxProps} />
    }
})
