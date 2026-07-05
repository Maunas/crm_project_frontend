import { AccordionSummary, Box, styled, type Theme } from '@mui/material'
import type { ColorShades } from 'src/types/shared'
import { getColorShades } from 'src/utils/formatters'

const getGradient = (theme: Theme, colorShades: ColorShades) => ({
    light: `linear-gradient(
        145deg,
        ${theme.alpha(colorShades.LIGHT, .2)} 0%, 
        ${theme.alpha(colorShades.LIGHTER, .1)} 50%,
        transparent 100%)`,
    dark: `linear-gradient(
        145deg,
        ${theme.alpha(colorShades.MAIN, .1)} 0%,
        ${theme.alpha(colorShades.DARKER, .05)} 50%,
        transparent 100%)`
})

export const GenericSidebarHeader = styled(Box)(
    ({ theme, color = "primary" }) => {
        const colorShades = getColorShades(color, theme)
        const gradient = getGradient(theme, colorShades)

        return ([
            {
                overflow: "hidden",
                margin: "-1.5rem -2rem 0",
                backgroundColor: theme.alpha(theme.palette.background.default, .5),
                backgroundImage: gradient.light
            },
            theme.applyStyles("dark", {
                backgroundColor: theme.alpha(theme.palette.background.paper, .5),
                backgroundImage: gradient.dark
            })
        ])
    }
)

export const GenericSidebarContent = styled(Box)(
    ({ theme }) => ([
        {
            flexGrow: 1,
            "& .sidebar-content": {
                flexGrow: 1,
            },
            "& .sidebar-footer": {
                margin: "1rem -2rem -1.5rem",
                padding: "1rem 1.5rem",
                minHeight: "5rem",
                borderTop: `1px solid ${theme.palette.divider}`,
                display: "flex",
                justifyContent: "end",
                backgroundColor: theme.alpha(theme.palette.background.default, .5),
            }
        },
        theme.applyStyles("dark", {
            "& .sidebar-footer": {
                backgroundColor: theme.palette.background.paper,
            }
        })
    ])
)

export const ColoredAccordionSummary = styled(AccordionSummary, {
    shouldForwardProp: (prop) =>
        !["isFirst", "isLast"].includes(prop as string),
})<{ isFirst?: boolean, isLast?: boolean }>(
    ({ theme, color = "primary", isFirst = false, isLast = false }) => {
        const colorShades = getColorShades(color, theme)
        const gradient = getGradient(theme, colorShades)
        const radius = theme.shape.borderRadius

        return ([
            {
                overflow: "hidden",
                backgroundImage: gradient.light,
                "&.Mui-expanded": {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                },
                ...(isFirst ? {
                    borderTopLeftRadius: radius,
                    borderTopRightRadius: radius,
                } : {}),
                ...(isLast ? {
                    "&:not(.Mui-expanded)": {
                        borderBottomLeftRadius: radius,
                        borderBottomRightRadius: radius,
                    },
                } : {}),
            },
            theme.applyStyles("dark", {
                backgroundImage: gradient.dark
            })
        ])
    }
)


export const GenericPaperColoredSection = styled(Box, {
    shouldForwardProp: (prop) =>
        !["color", "isFirst", "isLast", "pLeft", "pRight", "pTop", "pBottom"].includes(prop as string),
})<{
    color?: string,
    isFirst?: boolean,
    isLast?: boolean,
    pLeft?: string,
    pRight?: string,
    pTop?: string,
    pBottom?: string,
}>(
    ({ theme, color = "primary", isFirst = false, isLast = false, pLeft = "2rem", pRight = "2rem", pBottom = "1.5rem", pTop = "1.5rem" }) => {
        const colorShades = getColorShades(color, theme)
        const gradient = getGradient(theme, colorShades)
        const radius = theme.shape.borderRadius

        return ([
            {
                "&&": {
                    marginInline: `-${pLeft} -${pRight}`,
                    marginTop: isFirst ? `-${pTop}` : 0,
                    marginBottom: isLast ? `-${pBottom}` : 0,
                    ...(isFirst || isLast ? {
                        borderRadius: [
                            isFirst ? radius : "0",
                            isFirst ? radius : "0",
                            isLast ? radius : "0",
                            isLast ? radius : "0",
                        ].join(" ")
                    } : {}),
                },
                overflow: "hidden",
                padding: `${pTop} ${pLeft} ${pBottom} ${pRight}`,
                backgroundImage: gradient.light,
                borderTop: !isFirst ? `1px solid ${theme.palette.divider}` : undefined,
                borderBottom: !isLast ? `1px solid ${theme.palette.divider}` : undefined,
            },
            theme.applyStyles("dark", {
                backgroundImage: gradient.dark
            })
        ])
    }
)