import { useEffect, useMemo, useState } from 'react'
import {
    Box, FormControl, InputLabel, Select, MenuItem, TextField, IconButton, Paper, Typography, Tooltip, Chip,
    ToggleButton, ToggleButtonGroup, alpha,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import type { LeadField } from 'src/types/leadFields'
import type { NomenclatorItem } from 'src/types/nomenclators'
import type { UserPublic } from 'src/types/users'
import type { Team } from 'src/types/teams'
import type { Campaign } from 'src/types/campaigns'
import {
    NATIVE_FIELDS, NATIVE_FIELD_LABELS, NATIVE_DATE_FIELDS,
    OPERATOR_RULES, OPERATOR_LABELS, LIST_OPERATORS, VALID_RANGE_OPS_MIN, VALID_RANGE_OPS_MAX,
    ROUTING_FORBIDDEN_FIELD_TYPES, type LeadRoutingConditionPost, type NativeField, type ConditionMode,
} from 'src/types/routing'
import { getNomenclatorItems } from 'src/features/nomenclators/nomenclatorService'
import { getUsersInOrg } from 'src/features/auth/userServices'
import { getTeams } from 'src/features/teams/teamServices'
import { getCampaigns } from 'src/features/campaigns/campaignServices'
import { FieldSelector } from 'src/components/ui/forms/FieldSelector'

interface RoutingConditionRowProps {
    condition: LeadRoutingConditionPost,
    onUpdate: (condition: LeadRoutingConditionPost) => void,
    onDelete: () => void,
    isOnly: boolean,
    fields: LeadField[],
    campaignId: number | null,
    readOnly?: boolean,
}

const FIELD_MODE = { NATIVE: "native", DYNAMIC: "dynamic" } as const
type FieldMode = typeof FIELD_MODE[keyof typeof FIELD_MODE]

export const RoutingConditionRow = ({ condition, onUpdate, onDelete, isOnly, fields, campaignId, readOnly = false }: RoutingConditionRowProps) => {

    const allowedFields = useMemo(() => fields.filter(f => {
        if (ROUTING_FORBIDDEN_FIELD_TYPES.includes(f.field_type_code)) return false
        if (f.field_subtype_code && ROUTING_FORBIDDEN_FIELD_TYPES.includes(f.field_subtype_code)) return false
        return true
    }), [fields])

    const fieldMode: FieldMode = condition.native_field ? FIELD_MODE.NATIVE : FIELD_MODE.DYNAMIC
    const selectedField = allowedFields.find(f => f.id === condition.lead_field_id)

    // Categoría usada para buscar operadores válidos (OPERATOR_RULES)
    const typeCategory = condition.native_field
        ? (NATIVE_DATE_FIELDS.includes(condition.native_field) ? "_NATIVE_DATE" : "_NATIVE_ID")
        : (selectedField?.field_type_code ?? "STRING")

    const availableOperators = OPERATOR_RULES[typeCategory] ?? ["eq", "neq"]
    const supportsRange = availableOperators.some(op => VALID_RANGE_OPS_MIN.includes(op))
        && availableOperators.some(op => VALID_RANGE_OPS_MAX.includes(op))

    const currentMode: ConditionMode = (condition.operator_min || condition.operator_max) ? "range" : "simple"

    // ── Cambiar el tipo de campo (nativo / dinámico) ──────────────────────
    const handleFieldModeChange = (mode: FieldMode) => {
        if (mode === FIELD_MODE.NATIVE) {
            onUpdate({
                ...condition, lead_field_id: null, native_field: NATIVE_FIELDS[0],
                operator: "eq", value_str: "", value_list: null, operator_min: null, value_min: null, operator_max: null, value_max: null,
            })
        } else {
            onUpdate({
                ...condition, native_field: null, lead_field_id: allowedFields[0]?.id ?? null,
                operator: "eq", value_str: "", value_list: null, operator_min: null, value_min: null, operator_max: null, value_max: null,
            })
        }
    }

    // ── Cambiar el campo nativo elegido ───────────────────────────────────
    const handleNativeFieldChange = (native_field: NativeField) => {
        onUpdate({ ...condition, native_field, operator: "eq", value_str: "", value_list: null, operator_min: null, value_min: null, operator_max: null, value_max: null })
    }

    // ── Cambiar el campo dinámico elegido ─────────────────────────────────
    const handleDynamicFieldChange = (lead_field_id: number) => {
        onUpdate({ ...condition, lead_field_id, operator: "eq", value_str: "", value_list: null, operator_min: null, value_min: null, operator_max: null, value_max: null })
    }

    // ── Cambiar entre modo Simple/Lista y Rango ───────────────────────────
    const handleModeChange = (mode: ConditionMode) => {
        if (mode === "range") {
            onUpdate({ ...condition, operator: null, value_str: null, value_list: null, operator_min: "gt", value_min: "", operator_max: "lt", value_max: "" })
        } else {
            onUpdate({ ...condition, operator_min: null, value_min: null, operator_max: null, value_max: null, operator: "eq", value_str: "" })
        }
    }

    const handleOperatorChange = (operator: string) => {
        const isList = LIST_OPERATORS.includes(operator)
        onUpdate({
            ...condition, operator,
            value_str: isList ? null : (condition.value_str ?? ""),
            value_list: isList ? (condition.value_list ?? []) : null,
        })
    }

    return (
        <Paper elevation={0} sx={theme => ({
            p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
            bgcolor: theme.palette.mode === 'dark' ? 'background.default' : alpha(theme.palette.contrast[50], 0.5),
            border: '1px solid', borderColor: 'divider', borderRadius: 2,
        })}>
            <Chip label="SI" size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />

            <ToggleButtonGroup value={fieldMode} exclusive size="small" disabled={readOnly}
                onChange={(_, value) => value && handleFieldModeChange(value)}>
                <ToggleButton value={FIELD_MODE.NATIVE}>Nativo</ToggleButton>
                <ToggleButton value={FIELD_MODE.DYNAMIC} disabled={!campaignId}>Personalizado</ToggleButton>
            </ToggleButtonGroup>

            {fieldMode === FIELD_MODE.NATIVE ? (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Campo</InputLabel>
                    <Select disabled={readOnly} value={condition.native_field ?? ""} label="Campo"
                        onChange={e => handleNativeFieldChange(e.target.value as NativeField)}>
                        {NATIVE_FIELDS.map(nf => (
                            <MenuItem key={nf} value={nf}>{NATIVE_FIELD_LABELS[nf]}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : (
                <Box sx={{ minWidth: 200 }}>
                    <FieldSelector
                        fields={allowedFields}
                        disabled={readOnly || !campaignId}
                        disableClearable
                        value={condition.lead_field_id ?? null}
                        onChange={(fieldId) => { if (fieldId !== null) handleDynamicFieldChange(fieldId) }}
                    />
                    {!campaignId && <Typography variant="caption" color="text.secondary">Elegí una campaña para usar campos personalizados.</Typography>}
                </Box>
            )}

            {supportsRange &&
                <ToggleButtonGroup value={currentMode} exclusive size="small" disabled={readOnly}
                    onChange={(_, value) => value && handleModeChange(value)}>
                    <ToggleButton value="simple">Valor</ToggleButton>
                    <ToggleButton value="range">Rango</ToggleButton>
                </ToggleButtonGroup>
            }

            {currentMode === "simple" ? (
                <>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Operador</InputLabel>
                        <Select disabled={readOnly} value={condition.operator ?? ""} label="Operador"
                            onChange={e => handleOperatorChange(e.target.value)}>
                            {availableOperators.map(op => (
                                <MenuItem key={op} value={op}>{OPERATOR_LABELS[op] ?? op}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <RoutingConditionValueInput condition={condition} onUpdate={onUpdate} nativeField={condition.native_field ?? null}
                        selectedField={selectedField} readOnly={readOnly} />
                </>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 260 }}>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Desde</InputLabel>
                        <Select disabled={readOnly} value={condition.operator_min ?? "gt"} label="Desde"
                            onChange={e => onUpdate({ ...condition, operator_min: e.target.value })}>
                            {VALID_RANGE_OPS_MIN.map(op => <MenuItem key={op} value={op}>{OPERATOR_LABELS[op]}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <RangeValueInput value={condition.value_min ?? ""} onChange={v => onUpdate({ ...condition, value_min: v })}
                        typeCategory={typeCategory} readOnly={readOnly} label="Valor mínimo" />
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Hasta</InputLabel>
                        <Select disabled={readOnly} value={condition.operator_max ?? "lt"} label="Hasta"
                            onChange={e => onUpdate({ ...condition, operator_max: e.target.value })}>
                            {VALID_RANGE_OPS_MAX.map(op => <MenuItem key={op} value={op}>{OPERATOR_LABELS[op]}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <RangeValueInput value={condition.value_max ?? ""} onChange={v => onUpdate({ ...condition, value_max: v })}
                        typeCategory={typeCategory} readOnly={readOnly} label="Valor máximo" />
                </Box>
            )}

            <Tooltip title={isOnly ? "Debe haber al menos una condición" : "Eliminar condición"}>
                <span>
                    <IconButton size="small" onClick={onDelete} disabled={isOnly || readOnly} color="error" sx={{ ml: 'auto' }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </Paper>
    )
}

// ---------------------------------------------------------------------------
// Input de valor mínimo/máximo (rango) — solo campos numéricos o de fecha
// ---------------------------------------------------------------------------
interface RangeValueInputProps {
    value: string,
    onChange: (value: string) => void,
    typeCategory: string,
    readOnly?: boolean,
    label: string,
}
const RangeValueInput = ({ value, onChange, typeCategory, readOnly, label }: RangeValueInputProps) => {
    const isDateTime = typeCategory === "DATE_TIME"
    const isDate = typeCategory === "DATE" || typeCategory === "_NATIVE_DATE"
    if (isDate) {
        return <TextField size="small" type={isDateTime ? "datetime-local" : "date"} label={label} disabled={readOnly}
            value={value} onChange={e => onChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 170 }} />
    }
    return <TextField size="small" type="number" label={label} disabled={readOnly}
        value={value} onChange={e => onChange(e.target.value)} sx={{ minWidth: 130 }} />
}

// ---------------------------------------------------------------------------
// Input de valor (modo simple / lista), depende del tipo de campo o nativo
// ---------------------------------------------------------------------------
interface ValueInputProps {
    condition: LeadRoutingConditionPost,
    onUpdate: (condition: LeadRoutingConditionPost) => void,
    nativeField: NativeField | null,
    selectedField?: LeadField,
    readOnly?: boolean,
}
const RoutingConditionValueInput = ({ condition, onUpdate, nativeField, selectedField, readOnly }: ValueInputProps) => {

    const isListOp = condition.operator ? LIST_OPERATORS.includes(condition.operator) : false

    const [nomenclatorItems, setNomenclatorItems] = useState<NomenclatorItem[]>([])
    const [users, setUsers] = useState<UserPublic[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [campaigns, setCampaigns] = useState<Campaign[]>([])

    const isSelector = !nativeField && selectedField && ["SELECTOR", "CHECKBOX"].includes(selectedField.field_type_code)
    const isBool = !nativeField && selectedField?.field_type_code === "BOOL"
    const isDate = !nativeField && (selectedField?.field_type_code === "DATE" || selectedField?.field_type_code === "DATE_TIME")
    const isNumber = !nativeField && ["INT", "NUMBER", "MONEY", "RATING"].includes(selectedField?.field_type_code ?? "")

    useEffect(() => {
        if (isSelector && selectedField?.nomenclator_id) {
            getNomenclatorItems({ nomenclator_id: selectedField.nomenclator_id, page_size: 0, only_active: true })
                .then(res => setNomenclatorItems(res.items))
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNomenclatorItems([])
        }
    }, [isSelector, selectedField?.nomenclator_id])

    useEffect(() => {
        if (nativeField === "assigned_to_user_id") getUsersInOrg().then(setUsers)
        if (nativeField === "team_id") getTeams({ only_active: true, page_size: 0 }).then(res => setTeams(res.items))
        if (nativeField === "campaign_id") getCampaigns({ only_active: true, page_size: 0 }).then(res => setCampaigns(res.items))
    }, [nativeField])

    // ── Nativos: usuario asignado ─────────────────────────────────────────
    if (nativeField === "assigned_to_user_id") {
        return (
            <FormControl size="small" sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Usuario</InputLabel>
                <Select disabled={readOnly} value={condition.value_str ?? ""} label="Usuario"
                    onChange={e => onUpdate({ ...condition, value_str: e.target.value })}>
                    {users.map(u => <MenuItem key={u.id} value={`${u.id}`}>{u.name} {u.last_name} ({u.email})</MenuItem>)}
                </Select>
            </FormControl>
        )
    }
    // ── Nativos: equipo ────────────────────────────────────────────────────
    if (nativeField === "team_id") {
        return (
            <FormControl size="small" sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Equipo</InputLabel>
                <Select disabled={readOnly} value={condition.value_str ?? ""} label="Equipo"
                    onChange={e => onUpdate({ ...condition, value_str: e.target.value })}>
                    {teams.map(t => <MenuItem key={t.id} value={`${t.id}`}>{t.name}</MenuItem>)}
                </Select>
            </FormControl>
        )
    }
    // ── Nativos: campaña ───────────────────────────────────────────────────
    if (nativeField === "campaign_id") {
        return (
            <FormControl size="small" sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Campaña</InputLabel>
                <Select disabled={readOnly} value={condition.value_str ?? ""} label="Campaña"
                    onChange={e => onUpdate({ ...condition, value_str: e.target.value })}>
                    {campaigns.map(c => <MenuItem key={c.id} value={`${c.id}`}>{c.name}</MenuItem>)}
                </Select>
            </FormControl>
        )
    }
    // ── Nativos: estado actual (ID interno) ────────────────────────────────
    if (nativeField === "current_state_id") {
        return (
            <TextField size="small" type="number" label="ID de la etapa" disabled={readOnly}
                value={condition.value_str ?? ""} onChange={e => onUpdate({ ...condition, value_str: e.target.value })}
                helperText="ID interno de la etapa" sx={{ minWidth: 160 }} />
        )
    }
    // ── Nativos: fechas ─────────────────────────────────────────────────────
    if (nativeField === "created_at" || nativeField === "updated_at") {
        return <TextField size="small" type="datetime-local" label="Valor" disabled={readOnly}
            value={condition.value_str ?? ""} onChange={e => onUpdate({ ...condition, value_str: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 200 }} />
    }

    // ── Dinámico SELECTOR/CHECKBOX ──────────────────────────────────────────
    if (isSelector) {
        if (isListOp) {
            return (
                <FormControl size="small" sx={{ flex: 1, minWidth: 200 }}>
                    <InputLabel>Valores</InputLabel>
                    <Select multiple disabled={readOnly} value={condition.value_list ?? []} label="Valores"
                        onChange={e => onUpdate({ ...condition, value_list: typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value })}
                        renderValue={selected => (selected as string[])
                            .map(id => nomenclatorItems.find(i => `${i.id}` === id)?.value ?? id).join(", ")}>
                        {nomenclatorItems.map(item => <MenuItem key={item.id} value={`${item.id}`}>{item.value}</MenuItem>)}
                    </Select>
                </FormControl>
            )
        }
        return (
            <FormControl size="small" sx={{ flex: 1, minWidth: 200 }}>
                <InputLabel>Valor</InputLabel>
                <Select disabled={readOnly} value={condition.value_str ?? ""} label="Valor"
                    onChange={e => onUpdate({ ...condition, value_str: e.target.value })}>
                    {nomenclatorItems.map(item => <MenuItem key={item.id} value={`${item.id}`}>{item.value}</MenuItem>)}
                </Select>
            </FormControl>
        )
    }
    // ── Dinámico BOOL ────────────────────────────────────────────────────────
    if (isBool) {
        return (
            <FormControl size="small" sx={{ flex: 1, minWidth: 150 }}>
                <InputLabel>Valor</InputLabel>
                <Select disabled={readOnly} value={condition.value_str ?? ""} label="Valor"
                    onChange={e => onUpdate({ ...condition, value_str: e.target.value })}>
                    <MenuItem value="true">Sí</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                </Select>
            </FormControl>
        )
    }
    // ── Dinámico DATE / DATE_TIME ────────────────────────────────────────────
    if (isDate) {
        return <TextField size="small" type={selectedField?.field_type_code === "DATE_TIME" ? "datetime-local" : "date"}
            label="Valor" disabled={readOnly} value={condition.value_str ?? ""}
            onChange={e => onUpdate({ ...condition, value_str: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 180 }} />
    }
    // ── Dinámico numérico ────────────────────────────────────────────────────
    if (isNumber) {
        return <TextField size="small" type="number" label="Valor" disabled={readOnly}
            value={condition.value_str ?? ""} onChange={e => onUpdate({ ...condition, value_str: e.target.value })}
            sx={{ flex: 1, minWidth: 150 }} />
    }
    // ── Default: texto ──────────────────────────────────────────────────────
    return <TextField size="small" label="Valor" disabled={readOnly}
        value={condition.value_str ?? ""} onChange={e => onUpdate({ ...condition, value_str: e.target.value })}
        sx={{ flex: 1, minWidth: 150 }} />
}
