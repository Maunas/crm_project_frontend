import { Stack, Grid, Typography, TextField } from '@mui/material';
import { Controller, type Control, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';
import type { WebFormPost } from 'src/types/webForms';
import { DEFAULT_THEME_CONFIG } from 'src/types/webForms';
import { RegisteredTextInput } from 'src/components/ui/forms/CustomInputs';
import { InlineColorPickerButton } from 'src/components/ui/forms/ColorPicker';
import GenericPaper from 'src/components/layout/container/GenericPaper';
import CommonButton from 'src/components/ui/buttons/CommonButton';

interface WebFormThemeTabProps {
  control: Control<WebFormPost>;
  register: UseFormRegister<WebFormPost>;
  setValue: UseFormSetValue<WebFormPost>;
  readOnly: boolean;
}

interface ColorFieldProps {
  control: Control<WebFormPost>;
  name: `theme_config.${'primary_color' | 'background_color' | 'text_color' | 'button_text_color'}`;
  label: string;
  readOnly: boolean;
}

// Fila "texto hex + botón de color libre", mismo patrón que el selector de color de una etiqueta
// nueva (LeadTagsMenu.tsx) -- InlineColorPickerButton ya trae el Popover con HexColorPicker.
const ColorField = ({ control, name, label, readOnly }: ColorFieldProps) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <InlineColorPickerButton
          color={field.value ?? '#000000'}
          onChange={color => field.onChange(color)}
          ariaLabel={label}
        />
        <TextField
          fullWidth
          size="small"
          label={label}
          disabled={readOnly}
          value={field.value ?? ''}
          onChange={e => field.onChange(e.target.value)}
        />
      </Stack>
    )}
  />
);

// La vista previa de estilo (colores/tipografía/bordes aplicados) se muestra ahora en
// WebFormLivePreview, siempre visible al costado del formulario sin importar la pestaña activa --
// mantener una segunda acá sería redundante (pedido del usuario, 2026-08-17).
export const WebFormThemeTab = ({ control, register, setValue, readOnly }: WebFormThemeTabProps) => {
  const handleResetTheme = () => {
    setValue('theme_config', DEFAULT_THEME_CONFIG);
  };

  return (
    <Stack spacing={2}>
      <GenericPaper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4">Colores</Typography>
            {!readOnly && (
              <CommonButton actionType="NONE" variant="text" size="small" onClick={handleResetTheme}>
                Restablecer
              </CommonButton>
            )}
          </Stack>
          <Stack spacing={2}>
            <ColorField control={control} name="theme_config.primary_color" label="Color primario (botón, acentos)" readOnly={readOnly} />
            <ColorField control={control} name="theme_config.background_color" label="Fondo del formulario" readOnly={readOnly} />
            <ColorField control={control} name="theme_config.text_color" label="Color del texto" readOnly={readOnly} />
            <ColorField control={control} name="theme_config.button_text_color" label="Color del texto del botón" readOnly={readOnly} />
          </Stack>
        </Stack>
      </GenericPaper>

      <GenericPaper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Estilo</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RegisteredTextInput
                register={register}
                name="theme_config.border_radius"
                label="Bordes redondeados (ej: 6px)"
                disabled={readOnly}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RegisteredTextInput
                register={register}
                name="theme_config.font_family"
                label="Tipografía (CSS font-family)"
                disabled={readOnly}
                size="small"
              />
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary">
            Por ahora los estilos se limitan a estas opciones -- CSS libre va a estar disponible más adelante. Mirá los cambios en la vista previa de la derecha.
          </Typography>
        </Stack>
      </GenericPaper>
    </Stack>
  );
};
