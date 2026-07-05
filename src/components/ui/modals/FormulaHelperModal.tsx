import { useMemo, useState } from "react";
import { 
    TextField, InputAdornment, Accordion, AccordionSummary, 
    AccordionDetails, Typography, Stack, Button, Chip, Box, Paper, Collapse 
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { ExcelFormulaTemplate } from "src/types/leadFields";

interface FormulaHelperPanelProps {
    open: boolean;
    formulas: ExcelFormulaTemplate[];
    onInsert: (formulaName: string) => void;
}

export const FormulaHelperPanel = ({ open, formulas, onInsert }: FormulaHelperPanelProps) => {
    const [search, setSearch] = useState("");

    const filteredFormulas = useMemo(() => {
        if (!search) return formulas;
        const s = search.toLowerCase();
        return formulas.filter(f =>
            f.name_english.toLowerCase().includes(s) ||
            f.name_spanish.toLowerCase().includes(s) ||
            f.description.toLowerCase().includes(s)
        );
    }, [formulas, search]);

    const groupedFormulas = useMemo(() => {
        const groups: Record<string, ExcelFormulaTemplate[]> = {};
        filteredFormulas.forEach(f => {
            if (!groups[f.category]) groups[f.category] = [];
            groups[f.category].push(f);
        });
        return groups;
    }, [filteredFormulas]);

    return (
        <Collapse in={open} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
            <Paper variant="outlined" sx={{ mt: 1, p: 2, maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'background.default' }}>
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Buscar fórmula..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }
                    }}
                />

                <Box sx={{ overflowY: "auto", flexGrow: 1, pr: 1 }}>
                    {Object.keys(groupedFormulas).length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                            No se encontraron fórmulas.
                        </Typography>
                    ) : (
                        Object.entries(groupedFormulas).map(([category, catFormulas]) => (
                            <Accordion key={category} defaultExpanded={search.length > 0} disableGutters variant="outlined" sx={{ mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography sx={{ fontWeight: 'bold' }}>{category}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack spacing={2}>
                                        {catFormulas.map((f) => (
                                            <Box key={f.name_english} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                                                    <Stack spacing={0.5}>
                                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                                {f.name_english}
                                                            </Typography>
                                                            <Chip label={f.name_spanish} size="small" variant="outlined" color="primary" />
                                                        </Stack>
                                                        
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            {f.description}
                                                        </Typography>
                                                        
                                                        {/* --- NUEVO: Sintaxis --- */}
                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 'bold' }}>
                                                            {f.syntax}
                                                        </Typography>
                                                        
                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', p: 0.5, borderRadius: 1 }}>
                                                            Ej: {f.example}
                                                        </Typography>
                                                        
                                                        {f.note && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                Nota: {f.note}
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                    <Button 
                                                        variant="contained" 
                                                        size="small"
                                                        onClick={() => onInsert(f.name_english)}
                                                        sx={{ flexShrink: 0 }}
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
            </Paper>
        </Collapse>
    );
};