import { useEffect, useState, useMemo } from 'react'
import { 
    Stack, Typography, Box, Collapse, TextField, IconButton, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Select, MenuItem, FormControl
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { getSystemAudit } from './systemAuditServices'
import PaginationComponent from 'shared/ui/lists/PaginationComponent'
import { useListPagination } from 'src/hooks/useListPagination'
import type { SystemAuditLog } from 'src/types/systemAudit'
import type { Paginable } from 'src/types/shared'
import { getDictionaries } from 'src/services/generalService'

// --- Componente de Fila ---
// Agregamos 'mappings' como prop para mostrar nombres amigables
const AuditTableRow = ({ 
    log, 
    mappings 
}: { 
    log: SystemAuditLog, 
    mappings: any 
}) => {
    const [open, setOpen] = useState(false)
    const hasChanges = log.changes && Object.keys(log.changes).length > 0;

    // Traducir los nombres técnicos usando el mapping del back
    const entityDisplay = mappings?.entities[log.entity_type] || log.entity_type;
    const actionDisplay = mappings?.actions[log.action] || log.action;

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>{log.id}</TableCell>
                <TableCell>{entityDisplay}</TableCell>
                <TableCell>{log.entity_id}</TableCell>
                <TableCell><b>{actionDisplay}</b></TableCell>
                <TableCell>{log.created_by ? `#${log.created_by}` : 'Sistema'}</TableCell>
                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                <TableCell align="right">
                    {hasChanges && (
                        <IconButton size="small" onClick={() => setOpen(!open)}>
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    )}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            <Typography variant="subtitle2" gutterBottom color="primary">Detalle de Cambios:</Typography>
                            <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#1e1e1e", color: "#a6e22e", overflowX: "auto" }}>
                                <pre style={{ margin: 0, fontSize: "0.85rem" }}>
                                    {JSON.stringify(log.changes, null, 2)}
                                </pre>
                            </Paper>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}

// --- Componente Principal ---
export const SystemAuditList = () => {
    const [logs, setLogs] = useState<Paginable<SystemAuditLog> | null>(null)
    const [defs, setDefs] = useState<{ entities: any, actions: any } | null>(null)
    const { fetchPage, pageSize, refresh, pageComponentProps } = useListPagination(logs)

    const [filters, setFilters] = useState({
        entity_type: '',
        action: '',
        created_by: '',
        start_date: '',
        end_date: ''
    })

    const [debouncedFilters, setDebouncedFilters] = useState(filters)

    // Cargar definiciones al montar el componente
    useEffect(() => {
        getDictionaries(["entities", "system_audit_log_actions"]).then(data => {
            setDefs({
                entities: data.entities,
                actions: data.system_audit_log_actions
            })
        })
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedFilters(filters), 500)
        return () => clearTimeout(timer)
    }, [filters])

    useEffect(() => {
        // 1. Parámetros base
        const params: any = {
            page: fetchPage,
            page_size: pageSize,
            order_by: "created_at",
            ascending: false
        }

        // 2. Agregamos explícitamente los filtros si tienen algún valor
        if (debouncedFilters.entity_type) {
            params.entity_type = debouncedFilters.entity_type;
        }
        
        if (debouncedFilters.action) {
            params.action = debouncedFilters.action;
        }
        
        if (debouncedFilters.created_by) {
            params.created_by = debouncedFilters.created_by;
        }

        // FECHAS
        if (debouncedFilters.start_date) {
            params.start_date = debouncedFilters.start_date;
        }
        
        if (debouncedFilters.end_date) {
            params.end_date = debouncedFilters.end_date;
        }

        // 3. Ejecutamos el endpoint
        getSystemAudit(params).then(setLogs)
        
    }, [fetchPage, pageSize, refresh, debouncedFilters])

    // Handler unificado para TextField y Select
    const handleFilterChange = (e: any) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    }

    return (
        <Stack spacing={3} sx={{ p: 3 }}>
            <Typography variant="h1">Auditoría General del Sistema</Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                            <TableCell>ID</TableCell>
                            <TableCell>Entidad</TableCell>
                            <TableCell>ID Entidad</TableCell>
                            <TableCell>Acción</TableCell>
                            <TableCell>Usuario</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell align="right">Detalle</TableCell>
                        </TableRow>

                        {/* Fila de Filtros Selectores */}
                        <TableRow>
                            <TableCell />
                            <TableCell>
                                <FormControl fullWidth size="small" variant="standard">
                                    <Select
                                        name="entity_type"
                                        value={filters.entity_type}
                                        onChange={handleFilterChange}
                                        displayEmpty
                                    >
                                        <MenuItem value=""><em>Todas</em></MenuItem>
                                        {defs && Object.entries(defs.entities).map(([key, label]: any) => (
                                            <MenuItem key={key} value={key}>{label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </TableCell>
                            <TableCell />
                            <TableCell>
                                <FormControl fullWidth size="small" variant="standard">
                                    <Select
                                        name="action"
                                        value={filters.action}
                                        onChange={handleFilterChange}
                                        displayEmpty
                                    >
                                        <MenuItem value=""><em>Todas</em></MenuItem>
                                        {defs && Object.entries(defs.actions).map(([key, label]: any) => (
                                            <MenuItem key={key} value={key}>{label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </TableCell>
                            <TableCell>
                                <TextField 
                                    name="created_by" 
                                    placeholder="ID" 
                                    size="small" 
                                    variant="standard"
                                    value={filters.created_by} 
                                    onChange={handleFilterChange} 
                                />
                            </TableCell>
                            <TableCell>
                                <Stack direction="row" spacing={1}>
                                    <TextField name="start_date" type="date" size="small" variant="standard"
                                        value={filters.start_date} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
                                    <TextField name="end_date" type="date" size="small" variant="standard"
                                        value={filters.end_date} onChange={handleFilterChange} InputLabelProps={{ shrink: true }} />
                                </Stack>
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {logs?.items.map((log) => (
                            <AuditTableRow key={log.id} log={log} mappings={defs} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <PaginationComponent {...pageComponentProps} />
        </Stack>
    )
}