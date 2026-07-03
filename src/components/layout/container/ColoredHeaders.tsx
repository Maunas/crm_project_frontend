import { AccordionSummary, Box, styled } from '@mui/material'
import { getColorShades } from 'src/utils/formatters'

export const GenericSidebarHeader = styled(Box)(
    ({ theme, color = "primary" }) => {
        const colorShades = getColorShades(color, theme)

        return ([
            {
                margin: "-1.5rem -2rem 0",
                backgroundColor: theme.alpha(theme.palette.background.default, .5),
                backgroundImage: `linear-gradient(145deg,${theme.alpha(colorShades.LIGHT, .2)} 40%, rgba(47, 72, 146, 0) 100%)`
            },
            theme.applyStyles("dark", {
                backgroundColor: theme.alpha(theme.palette.background.paper, .5),
                backgroundImage: `linear-gradient(145deg,${theme.alpha(colorShades.DARK, .15)} 0%, rgba(47, 72, 146, 0) 80%)`
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
                backgroundColor: theme.alpha(theme.palette.background.paper, .5),
            }
        })
    ])
)

export const ColoredAccordionSummary = styled(AccordionSummary)(
    ({ theme, color = "primary" }) => {
        const colorShades = getColorShades(color, theme)

        return ([
            {
                backgroundImage: `linear-gradient(145deg,${theme.alpha(colorShades.LIGHT, .2)} 40%, rgba(47, 72, 146, 0) 100%)`
            },
            theme.applyStyles("dark", {
                backgroundImage: `linear-gradient(145deg,${theme.alpha(colorShades.DARK, .15)} 0%, rgba(47, 72, 146, 0) 80%)`
            })
        ])
    }
)


export const GenericPaperColoredSection = styled(Box)(
    ({ theme, color = "primary", isFirst = false, isLast = false, pLeft = "2rem", pRight = "2rem", pBottom = "1.5rem", pTop = "1.5rem" }) => {
        const colorShades = getColorShades(color, theme)

        return ([
            {
                "&&": {
                    marginInline: `-${pLeft} -${pRight}`,
                    marginTop: isFirst ? `-${pTop}` : 0,
                    marginBottom: isLast ? `-${pBottom}` : 0,
                },
                padding: `${pTop} ${pLeft} ${pBottom} ${pRight}`,
                backgroundImage: `linear-gradient(145deg,${theme.alpha(colorShades.LIGHT, .2)} 40%, transparent 100%)`
            },
            theme.applyStyles("dark", {
                backgroundImage: `linear-gradient(145deg,${theme.alpha(colorShades.DARK, .15)} 0%, transparent 80%)`
            })
        ])
    }
)