import { useMemo, useState } from "react";
import { 
    Dialog, DialogTitle, DialogContent, TextField, InputAdornment, 
    Accordion, AccordionSummary, AccordionDetails, Typography, 
    Stack, Button, Chip, Box, IconButton 
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import type { ExcelFormulaTemplate } from "src/types/leadFields";

interface FormulaHelperModalProps {
    open: boolean;
    onClose: () => void;
    formulas: ExcelFormulaTemplate[];
    onInsert: (formulaName: string) => void;
}

export const FormulaHelperModal = ({ open, onClose, formulas, onInsert }: FormulaHelperModalProps) => {
    const [search, setSearch] = useState("");

    // Filtrar las fórmulas por la búsqueda (español, inglés o descripción)
    const filteredFormulas = useMemo(() => {
        if (!search) return formulas;
        const s = search.toLowerCase();
        return formulas.filter(f =>
            f.name_english.toLowerCase().includes(s) ||
            f.name_spanish.toLowerCase().includes(s) ||
            f.description.toLowerCase().includes(s)
        );
    }, [formulas, search]);

    // Agrupar las fórmulas por categoría
    const groupedFormulas = useMemo(() => {
        const groups: Record<string, ExcelFormulaTemplate[]> = {};
        filteredFormulas.forEach(f => {
            if (!groups[f.category]) groups[f.category] = [];
            groups[f.category].push(f);
        });
        return groups;
    }, [filteredFormulas]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Asistente de Fórmulas
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar fórmula..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
                    {Object.keys(groupedFormulas).length === 0 ? (
                        <Typography color="text.secondary" textAlign="center" mt={4}>
                            No se encontraron fórmulas.
                        </Typography>
                    ) : (
                        Object.entries(groupedFormulas).map(([category, catFormulas]) => (
                            <Accordion key={category} defaultExpanded={search.length > 0}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight="bold">{category}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack spacing={2}>
                                        {catFormulas.map((f) => (
                                            <Box key={f.name_english} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                    <Stack spacing={0.5}>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                {f.name_english}
                                                            </Typography>
                                                            <Chip label={f.name_spanish} size="small" variant="outlined" color="primary" />
                                                        </Stack>
                                                        <Typography variant="body2">{f.description}</Typography>
                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', p: 0.5, borderRadius: 1 }}>
                                                            Ej: {f.example}
                                                        </Typography>
                                                        {f.note && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                Nota: {f.note}
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                    <Button 
                                                        variant="contained" 
                                                        size="small"
                                                        onClick={() => onInsert(f.name_english)}
                                                    >
                                                        Insertar
                                                    </Button>
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};