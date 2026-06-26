import { useEffect, useMemo, useState } from 'react'
import { ControlledSwitch, RegisteredTextInput } from 'shared/ui/forms/CustomInputs'
import { ControlledAutocomplete } from 'shared/ui/forms/CustomMultipleInputs'
import { FormErrorMessage } from 'shared/ui/forms/FormFeedback'
import CommonButton from 'shared/ui/buttons/CommonButton'
import { useLoading } from 'src/hooks/useLoading';
import type { StateCategory } from 'src/types/leadFlow'
import { DEFAULT_STATE_COLORS } from './leadFlowServices/leadFlowUtils'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Stack, Typography, ButtonGroup, Paper, IconButton, TextField } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { ControlledColorPicker } from 'src/components/ui/forms/ColorPicker'

export const CATEGORY_OPTIONS = [
  {
    code: "OPEN",
    label: 'Abierto',
    color: DEFAULT_STATE_COLORS.OPEN,
  },
  {
    code: "WON",
    label: 'Éxito',
    color: DEFAULT_STATE_COLORS.WON,
  },
  {
    code: "LOST",
    label: 'Fracaso',
    color: DEFAULT_STATE_COLORS.LOST,
  },
]

interface EditorStatePost {
  name: string,
  category: StateCategory,
  is_initial: boolean,
  color: string,
}

interface StateDialogProps {
  existingState?: EditorStatePost | null,
  onClose: () => void,
  onSave: (state: EditorStatePost) => void,
  hasInitialState: boolean
}
/**Formulario de creación/modificación de States */
export default function StateForm({ existingState, onClose, onSave, hasInitialState }: StateDialogProps) {

  const defaultValues = useMemo(() => ({
    name: existingState?.name ?? "",
    category: existingState?.category ?? "OPEN",
    is_initial: existingState?.is_initial ?? false,
    color: existingState?.color ?? DEFAULT_STATE_COLORS.OPEN
  }), [existingState])

  const { register, control, reset, setValue, formState: { errors }, setError, handleSubmit } = useForm<EditorStatePost>({ defaultValues })

  const isEditing = !!existingState

  useEffect(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

  const newCategory = useWatch({ name: "category", control })
  const isInitial = useWatch({ name: "is_initial", control })

  useEffect(() => {
    if (isEditing) return
    setValue("color", DEFAULT_STATE_COLORS[newCategory])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newCategory])

  useEffect(() => {
    if (isEditing) return
    if (isInitial) setValue("color", DEFAULT_STATE_COLORS.INITIAL)
    else setValue("color", DEFAULT_STATE_COLORS[newCategory])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitial])

  const canSelectInitial = !hasInitialState || (isEditing && existingState?.is_initial)

  const handleSave = (data: EditorStatePost) => {
    try {
      if (!data.name || !data.name.trim()) throw new Error("El nombre no puede estar vacío.")
      if (!canSelectInitial && data.is_initial) throw new Error("Ya hay un estado inicial.")
      onSave(data)
      onClose()
    } catch (e) {
      const error = e as { message: string }
      setError("root", { message: error.message })
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <Stack spacing={3}>
        <Typography variant='h2' >{isEditing ? 'Editar Estado' : 'Crear Nuevo Estado'}</Typography>
        <Stack spacing={2} sx={{ alignItems: "start" }}>
          <RegisteredTextInput register={register} name='name' label='Nombre' required />
          <ControlledAutocomplete
            control={control} name="category" options={CATEGORY_OPTIONS} returnField="code" label="Categoría"
            getOptionKey={op => op.code} getOptionLabel={op => op.label} required />
          {canSelectInitial && (
            <ControlledSwitch control={control} name='is_initial' label="Es estado inicial" />
          )}
          <ControlledColorPicker control={control} name="color" sx={{ width: "100%" }} />
          <FormErrorMessage>{errors?.root?.message}</FormErrorMessage>
        </Stack>
        <ButtonGroup sx={{ alignSelf: "end" }}>
          <CommonButton actionType='CLOSE' variant="text" onClick={onClose}>Cancelar</CommonButton>
          <CommonButton actionType={isEditing ? "MODIFY" : "CREATE"}
            variant="contained" type='submit'>
            Guardar
          </CommonButton>
        </ButtonGroup>
      </Stack>
    </form>
  )
}


interface HeaderProps {
  initialName: string,
  initialDescription: string,
  handleSaveFlow: (flowName: string, flowDescription: string) => Promise<void>,
  statesLength: number
}
/**
 *  Header con formulario de guardado de Graph
 */
export const FlowEditorHeader = ({ initialName, initialDescription, statesLength, handleSaveFlow }: HeaderProps) => {

  const [flowName, setFlowName] = useState<string>('')
  const [flowDescription, setFlowDescription] = useState<string>('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlowDescription(initialDescription)
    setFlowName(initialName)
  }, [initialName, initialDescription])

  const navigate = useNavigate();

  const { loading, fnWithLoading: saveFlowLoad } = useLoading(() => handleSaveFlow(flowName, flowDescription))

  // Vuelve al formulario, con los datos guardados del sessionStorage.
  const handleBack = () => {
    const returnUrl = sessionStorage.getItem('flow_return_url');
    if (returnUrl) {
      sessionStorage.removeItem('flow_return_url');
      navigate(returnUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <Stack component={Paper} direction="row" spacing={4} useFlexGap
      sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', alignItems: 'center', justifyContent: 'space-between', borderRadius: 0, flexWrap: "wrap" }}>
      <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
        <IconButton onClick={handleBack} sx={{ color: 'text.secondary' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2" component="h1" sx={{ fontWeight: "bold" }} color="text.primary">
          Editor de Flujo
        </Typography>
      </Stack>

      <Stack spacing={1} direction="row" useFlexGap sx={{ flex: 1, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Nombre"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          sx={{ flex: 1, minWidth: "10rem" }}
        />
        <TextField
          size="small"
          label="Descripción (Opcional)"
          value={flowDescription}
          onChange={(e) => setFlowDescription(e.target.value)}
          sx={{ flex: 2, minWidth: "10rem" }}
        />
      </Stack>

      <CommonButton actionType={loading ? "LOADING" : "SAVE"} onClick={saveFlowLoad} disabled={loading || statesLength === 0} sx={{ ml: "auto" }}>
        {loading ? 'Guardando...' : 'Guardar Flujo'}
      </CommonButton>
    </Stack>
  )
}
