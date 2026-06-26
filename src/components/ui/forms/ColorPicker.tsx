import { Box, Button, IconButton, Popover, Stack, useTheme, type Theme } from "@mui/material"
import { Controller, type Control, type ControllerRenderProps, type FieldValues, type Path } from "react-hook-form"
import { colorTypesArray } from "src/types/mui-theme.d"
import { FormErrorMessage } from "./FormFeedback"
import { getColorShades } from "src/utils/formatters"
import CircleIcon from '@mui/icons-material/Circle';
import { HexColorInput, HexColorPicker } from "react-colorful";
import { useMemo, useState } from "react"

interface ColorSelectorProps<T extends FieldValues> {
    control: Control<T>,
    name: Path<T>,
    size?: "medium" | "small",
    row?: boolean,
    onBeforeChange?: (color: string) => void
}

export const ControlledColorPicker = <T extends FieldValues>({ control, size = "medium", row = false, name, onBeforeChange }: ColorSelectorProps<T>) => {
    const theme = useTheme()

    return (
        <Controller control={control} name={name}
            render={({ field, fieldState }) => {
                return (
                    <>
                        <Stack spacing={1} sx={{ py: 1 }}>
                            <Stack spacing={2} useFlexGap direction={row ? "row" : "column"}
                                sx={{ justifyContent: "space-evenly", alignItems: "center", flexWrap: "wrap" }}>
                                <Stack direction="row" useFlexGap sx={{ alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                                    {colorTypesArray.map(colorName => (
                                        <ColorPickerButton field={field} size={size} colorName={colorName} theme={theme} onBeforeChange={onBeforeChange} />
                                    ))
                                    }
                                </Stack>
                                <ColorPickerMenu field={field} theme={theme} size={size} row={row} onBeforeChange={onBeforeChange} />
                            </Stack>
                            {fieldState.error?.message && typeof fieldState.error?.message === "string" && (
                                <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
                            )}
                        </Stack>

                    </>
                )
            }} />

    )
}

interface ColorPickerMenuProps<T extends FieldValues> {
    field: ControllerRenderProps<T, Path<T>>,
    theme: Theme,
    size?: "medium" | "small",
    row?: boolean
    onBeforeChange?: (color: string) => void
}

export const ColorPickerMenu = <T extends FieldValues>({ field, theme, size, row = false, onBeforeChange }: ColorPickerMenuProps<T>) => {

    const paletteColor = useMemo(() => getColorShades(field.value, theme), [field.value, theme])
    const [pickerAnchor, setPickerAnchor] = useState<HTMLButtonElement | null>(null)

    return (
        <>
            <Button fullWidth={!row} sx={{
                flexGrow: "1",
                minWidth: size === "small" ? "4rem" : "6rem",
                maxWidth: size === "small" ? "9rem" : "15rem",
                height: size === "small" ? "1.5rem" : "2rem", p: "2px",
                border: `2px solid ${paletteColor.LIGHTER}`,
                borderRadius: ".5rem",
            }}
                onClick={e => setPickerAnchor(e.currentTarget)}
            >
                <Box sx={{
                    width: "100%", height: "100%",
                    backgroundColor: paletteColor.MAIN,
                    borderRadius: ".25rem",
                }} />
            </Button>
            <Popover
                id="color-picker"
                open={Boolean(pickerAnchor)}
                anchorEl={pickerAnchor}
                onClose={() => setPickerAnchor(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <HexColorPicker color={paletteColor.MAIN}
                    onChangeEnd={color => {
                        if (onBeforeChange) onBeforeChange(color)
                        field.onChange(color)
                    }} />
                <HexColorInput color={paletteColor.MAIN}
                    onChange={color => {
                        if (onBeforeChange) onBeforeChange(color)
                        field.onChange(color)
                    }}
                    style={{ width: "100%" }} prefixed />
            </Popover>
        </>
    )
}

interface ColorPickerButtonProps<T extends FieldValues> {
    field: ControllerRenderProps<T, Path<T>>
    theme: Theme,
    size?: "medium" | "small",
    colorName: string,
    onBeforeChange?: (color: string) => void
}
export const ColorPickerButton = <T extends FieldValues>({ field, size, colorName, theme, onBeforeChange }: ColorPickerButtonProps<T>) => {
    const paletteColor = useMemo(() => getColorShades(colorName, theme), [colorName, theme])

    return (
        <IconButton key={colorName}
            size="small" sx={{ p: size === "small" ? "2px" : undefined }}
            onClick={() => {
                if (onBeforeChange) onBeforeChange(colorName)
                field.onChange(colorName)
            }}>
            <CircleIcon sx={{
                color: paletteColor.MAIN,
                width: size === "small" ? "1.1rem" : " 1.5rem",
                height: size === "small" ? "1.1rem" : " 1.5rem",
                borderRadius: "50%",
                border: field.value === colorName ? `2px solid ${paletteColor.LIGHTER}` : ""
            }} />
        </IconButton>
    )
}
