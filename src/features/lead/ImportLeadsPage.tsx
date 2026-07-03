import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box, Button, Container, Grid, Paper, Step, StepLabel, Stepper,
    Typography, Stack, Select, MenuItem, FormControl, InputLabel, Alert,
    CircularProgress, useTheme, alpha, Divider, Card, CardContent
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningIcon from '@mui/icons-material/Warning';

import type { LeadField } from 'src/types/leadFields';
import { getLeadFields } from 'src/features/leadFields/leadFieldServices';
import { detectImportHeaders, processImport } from './leadService';
import { showCommonErrorToast } from 'src/utils/feedback';

// Agregamos el paso de Resultados
const STEPS = ['Subir archivo Excel', 'Mapear Columnas', 'Resultados'];

// Interfaz para la respuesta del backend
interface ImportResponse {
    total_rows: number;
    imported: number;
    failed: number;
    errors: string[];
}

const normalizeString = (str: string) => {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
};

export const ImportLeadsPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const campaignId = params.get('campaign');

    const [activeStep, setActiveStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Guardar la respuesta final del backend
    const [importResult, setImportResult] = useState<ImportResponse | null>(null);

    const [isDragging, setIsDragging] = useState(false);

    const [file, setFile] = useState<File | null>(null);
    const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
    const [leadFields, setLeadFields] = useState<LeadField[]>([]);

    const [uiMapping, setUiMapping] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!campaignId) {
            setError("No hay campaña seleccionada.");
            return;
        }
        getLeadFields({ campaign_id: Number(campaignId), page_size: 0, only_active: true })
            .then(res => setLeadFields(res.items))
            .catch(() => setError("Error al cargar los campos de la campaña."));
    }, [campaignId]);

    const processSelectedFile = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsLoading(true);
        setError(null);
        setImportResult(null);

        try {
            const res = await detectImportHeaders(selectedFile);
            const detectedHeaders = res.headers;
            setExcelHeaders(detectedHeaders);

            const newMapping: Record<string, string> = {};
            const availableHeaders = [...detectedHeaders];

            leadFields.forEach(field => {
                const normDbField = normalizeString(field.name);

                let matchIdx = availableHeaders.findIndex(h => normalizeString(h) === normDbField);

                if (matchIdx === -1) {
                    matchIdx = availableHeaders.findIndex(h => {
                        const normH = normalizeString(h);
                        if (normH.length > 3 && normDbField.length > 3) {
                            return normH.includes(normDbField) || normDbField.includes(normH);
                        }
                        return false;
                    });
                }

                if (matchIdx !== -1) {
                    newMapping[field.name] = availableHeaders[matchIdx];
                    availableHeaders.splice(matchIdx, 1);
                }
            });

            setUiMapping(newMapping);
            setActiveStep(1);
        } catch (err) {
            showCommonErrorToast(err, "Error al leer el archivo Excel. Asegúrate de que sea un formato válido.")
            setFile(null);
            setUiMapping({});
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            processSelectedFile(droppedFile);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processSelectedFile(selectedFile);
        }
    };

    const handleMapChange = useCallback((fieldName: string, excelHeader: string) => {
        setUiMapping(prev => ({
            ...prev,
            [fieldName]: excelHeader
        }));
    }, []);

    const missingRequiredFields = useMemo(() => {
        return leadFields
            .filter(field => field.required)
            .filter(field => !uiMapping[field.name] || uiMapping[field.name] === "");
    }, [leadFields, uiMapping]);

    const isMappingValid = missingRequiredFields.length === 0;

    const handleSubmit = async () => {
        if (!campaignId || !file || !isMappingValid) return;
        setIsLoading(true);
        setError(null);

        const payloadMapping: Record<string, string> = {};
        Object.entries(uiMapping).forEach(([dbField, exHeader]) => {
            if (exHeader) {
                payloadMapping[exHeader] = dbField;
            }
        });

        try {
            // El backend devuelve 200 OK y el JSON con los contadores/errores
            const result = await processImport(Number(campaignId), file, payloadMapping);
            setImportResult(result);
            setActiveStep(2); // Avanzar a pantalla de resultados
        } catch (err) {
            // Esto solo se dispara si el backend devuelve un 500, 401, etc.
            setError("Error de servidor procesando la importación. Intente nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- FUNCIÓN PARA FORMATEAR EL STRING FEO DE ERRORES DEL BACKEND ---
    const renderErrorString = (errString: string) => {
        // Ejemplo de entrada: "Fila 2: 400: [{'field': 'Nombre', 'message': 'Ya existe...'}]"
        try {
            // Separa "Fila 2" del resto
            const splitByRow = errString.split(": 400: ");
            if (splitByRow.length !== 2) return <Typography variant="body2">{errString}</Typography>;

            const rowNumber = splitByRow[0];
            // El backend envía un JSON stringificado con comillas simples, hay que arreglarlo para parsearlo
            const jsonLikeString = splitByRow[1].replace(/'/g, '"');
            const errorArray = JSON.parse(jsonLikeString);

            return (
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{rowNumber}</Typography>
                    <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                        {errorArray.map((errObj: any, idx: number) => (
                            <li key={idx}>
                                <Typography variant="body2">
                                    <strong>{errObj.field}:</strong> {errObj.message}
                                </Typography>
                            </li>
                        ))}
                    </ul>
                </Box>
            );
        } catch (e) {
            // Fallback por si la estructura del string del error no es la esperada
            return <Typography variant="body2">{errString}</Typography>;
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 5 }}>
            <Stack spacing={4}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="h2" sx={{ fontWeight: "bold" }}>Importar Leads</Typography>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(`/leads?campaign=${campaignId}`)}
                    >
                        Volver a Leads
                    </Button>
                </Stack>

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
                    {STEPS.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, minHeight: '400px' }}>

                    {/* PASO 1: ZONA DRAG AND DROP */}
                    {activeStep === 0 && (
                        <Box
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            sx={{
                                border: '2px dashed',
                                borderColor: isDragging ? theme.palette.primary.main : theme.palette.divider,
                                backgroundColor: isDragging ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.background.paper, 0.4),
                                borderRadius: 4,
                                p: 6,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '320px',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease-in-out',
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                }
                            }}
                            component="label"
                        >
                            <input
                                type="file"
                                hidden
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileInputChange}
                                disabled={isLoading}
                            />
                            {isLoading ? (
                                <Stack spacing={2} sx={{ alignItems: "center" }}>
                                    <CircularProgress size={45} thickness={4} />
                                    <Typography variant="body1" color="text.secondary">
                                        Analizando estructura del archivo...
                                    </Typography>
                                </Stack>
                            ) : (
                                <Stack spacing={2} sx={{ alignItems: "center", textAlign: 'center' }}>
                                    <CloudUploadIcon
                                        sx={{
                                            fontSize: 56,
                                            color: isDragging ? theme.palette.primary.main : theme.palette.text.secondary,
                                            transition: 'color 0.2s'
                                        }}
                                    />
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                        Arrastrá tu archivo Excel acá
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        o hacé clic para buscar en tu dispositivo (.xlsx, .xls, .csv)
                                    </Typography>
                                </Stack>
                            )}
                        </Box>
                    )}

                    {/* PASO 2: MAPEO DE COLUMNAS */}
                    {activeStep === 1 && (
                        <Stack spacing={4}>
                            <Alert severity={isMappingValid ? "success" : "warning"} sx={{ borderRadius: 2 }}>
                                {isMappingValid
                                    ? "Todos los campos obligatorios fueron asociados exitosamente."
                                    : `Faltan asociar columnas obligatorias: ${missingRequiredFields.map(f => f.name).join(', ')}`}
                            </Alert>

                            <Grid container spacing={2} sx={{ pb: 1, borderBottom: `2px solid ${theme.palette.divider}` }}>
                                <Grid size={6}>
                                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 700 }}>
                                        Campo en Base de Datos (CRM)
                                    </Typography>
                                </Grid>
                                <Grid size={6}>
                                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 700 }}>
                                        Columna del archivo Excel
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={3.5}>
                                {leadFields.map((field) => (
                                    <Grid size={12} key={field.id}>
                                        <Grid container spacing={2} sx={{ alignItems: "center" }}>
                                            <Grid size={6}>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {field.name}
                                                    {field.required && (
                                                        <Box component="span" sx={{ color: theme.palette.error.main, ml: 0.5, fontWeight: 'bold' }}>
                                                            *
                                                        </Box>
                                                    )}
                                                </Typography>
                                            </Grid>
                                            <Grid size={6}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Asociar Columna</InputLabel>
                                                    <Select
                                                        value={uiMapping[field.name] || ''}
                                                        label="Asociar Columna"
                                                        onChange={(e) => handleMapChange(field.name, e.target.value)}
                                                    >
                                                        <MenuItem value="">
                                                            <em style={{ color: theme.palette.text.disabled }}>-- Ignorar columna --</em>
                                                        </MenuItem>
                                                        {excelHeaders.map(header => (
                                                            <MenuItem key={header} value={header}>{header}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                        <Divider sx={{ mt: 2.5, opacity: 0.6 }} />
                                    </Grid>
                                ))}
                            </Grid>

                            <Stack direction="row" sx={{ justifyContent: "space-between", mt: 4, pt: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={() => { setActiveStep(0); setFile(null); setUiMapping({}); }}
                                    disabled={isLoading}
                                >
                                    Elegir otro archivo
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={!isMappingValid || isLoading}
                                    onClick={handleSubmit}
                                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                                    sx={{ px: 4 }}
                                >
                                    {isLoading ? "Procesando..." : "Iniciar Importación"}
                                </Button>
                            </Stack>
                        </Stack>
                    )}

                    {/* PASO 3: RESULTADOS */}
                    {activeStep === 2 && importResult && (
                        <Stack spacing={4}>
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                {importResult.failed === 0 ? (
                                    <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                                ) : (
                                    <WarningIcon color="warning" sx={{ fontSize: 64, mb: 2 }} />
                                )}
                                <Typography variant="h4" gutterBottom>Importación Finalizada</Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Se analizaron {importResult.total_rows} filas en total.
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), border: `1px solid ${theme.palette.success.main}` }}>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" color="success.main">{importResult.imported}</Typography>
                                            <Typography variant="subtitle1">Leads Importados</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${theme.palette.error.main}` }}>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" color="error.main">{importResult.failed}</Typography>
                                            <Typography variant="subtitle1">Leads Fallidos</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {importResult.errors.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="h6" color="error" gutterBottom>
                                        Detalle de Errores ({importResult.errors.length}):
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, maxHeight: '300px', overflowY: 'auto', bgcolor: alpha(theme.palette.error.light, 0.05) }}>
                                        <Stack spacing={2}>
                                            {importResult.errors.map((err, i) => (
                                                <Alert severity="error" key={i} sx={{ '& .MuiAlert-message': { width: '100%' } }}>
                                                    {renderErrorString(err)}
                                                </Alert>
                                            ))}
                                        </Stack>
                                    </Paper>
                                </Box>
                            )}

                            <Stack direction="row" sx={{ justifyContent: "center", mt: 4 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate(`/leads?campaign=${campaignId}`)}
                                >
                                    Ir al listado de Leads
                                </Button>
                            </Stack>
                        </Stack>
                    )}
                </Paper>
            </Stack>
        </Container>
    );
};