import { Select, type SelectProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { textTheme } from "src/theme/typographyTheme";
import { getColorShades } from "src/utils/formatters";

const CHIP_OPACITY = .25
const CHIP_SIZES = {
    small: { padding: "1px .5rem", gap: "2px", fontSize: ".75rem" },
    medium: { padding: ".25rem .5rem", gap: ".25rem", fontSize: ".875rem" },
}

const ICON_SIZE_EM = textTheme.root.lineHeight

interface ChipSelectBaseProps {
    chipColor?: string
    defaultColor?: string
}

const ChipSelectRoot = styled(Select, {
    shouldForwardProp: (prop) => prop !== "chipColor" && prop !== "defaultColor",
})<ChipSelectBaseProps>(
    ({ theme, chipColor, defaultColor = "primary", size = "medium" }) => {
        const resolvedColor = chipColor ?? defaultColor
        const paletteColors = getColorShades(resolvedColor, theme)
        const sizeObject = CHIP_SIZES[size as keyof typeof CHIP_SIZES] ?? CHIP_SIZES.medium

        return [{
            backdropFilter: "blur(8px)",
            fontWeight: "500",
            height: "auto",
            border: "1px solid",
            borderRadius: ".75rem",
            backgroundColor: theme.alpha(paletteColors.LIGHT, CHIP_OPACITY),
            borderColor: theme.alpha(paletteColors.MAIN, .5),
            color: theme.palette.contrast[900],
            ...sizeObject,
            // Oculta el borde por defecto del OutlinedInput
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            // Acerca el icono al texto
            "& .MuiSelect-icon": {
                fontSize: `${ICON_SIZE_EM}em`,
                right: "3px",
            },
            "& .MuiSelect-select": {
                padding: 0,
                paddingRight: "1rem !important",
                display: "flex",
                alignItems: "center",
            },
        },
        theme.applyStyles("dark", {
            backgroundColor: theme.alpha(paletteColors.DARKER, CHIP_OPACITY),
            color: theme.palette.common.white,
        }),
        ]
    },
)

type ChipSelectComponent = <Value = unknown>(
    props: SelectProps<Value> & ChipSelectBaseProps
) => React.JSX.Element

const ChipSelect = ChipSelectRoot as ChipSelectComponent

export default ChipSelect
