import { useEffect, useMemo } from 'react'
import { ControlledSwitch, RegisteredTextInput } from 'shared/ui/forms/CustomInputs'
import { ControlledAutocomplete } from 'shared/ui/forms/CustomMultipleInputs'
import { FormErrorMessage } from 'shared/ui/forms/FormFeedback'
import CommonButton from 'shared/ui/buttons/CommonButton'
import { CATEGORY_CONFIG, DEFAULT_STATE_COLORS } from 'src/types/leadFlow'
import type { StateCategory } from 'src/types/leadFlow'
import { useForm, useWatch } from 'react-hook-form'
import { Stack, Typography, ButtonGroup } from '@mui/material'

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

export default function StateForm({ existingState, onClose, onSave, hasInitialState }: StateDialogProps) {

  const defaultValues = useMemo(() => ({
    name: existingState?.name ?? "",
    category: existingState?.category ?? "OPEN",
    is_initial: existingState?.is_initial ?? false,
    color: existingState?.color ?? '#2196f3'
  }), [existingState])

  const { register, control, reset, setValue, formState: { errors }, setError, handleSubmit } = useForm<EditorStatePost>({ defaultValues })

  const isEditing = !!existingState

  useEffect(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

  const newCategory = useWatch({ name: "category", control })

  useEffect(() => {
    if (isEditing) return
    setValue("color", CATEGORY_CONFIG[newCategory].color)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newCategory])

  const canSelectInitial = !hasInitialState || (isEditing && existingState?.is_initial)

  const handleSave = (data: EditorStatePost) => {
    try {
      console.log(data)
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
          <RegisteredTextInput register={register} name='color' type="color"
            label="Color del Estado" />
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