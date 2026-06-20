import { Paper, styled, type PaperProps } from '@mui/material'

//To Do: Estilizar
/** Centraliza los estilos de Paper en el sistema. */
const GenericPaper = styled(
    (props: PaperProps) => <Paper elevation={0} {...props}>{props.children}</Paper>)(
        ({ theme, elevation = 0 }) => {

            const originalGradient = "var(--Paper-overlay)"
            const originalShadow = "var(--Paper-shadow)"

            const newGradient = `linear-gradient(180deg, ${theme.alpha(theme.palette.contrast[50], .04)}, ${theme.alpha(theme.palette.contrast[900], .04)})`
            const lightOverlay = `linear-gradient(${theme.alpha(theme.palette.contrast[50], .03)})`

            return [{
                padding: "1.5rem 2rem",
                width: "100%"
            },
            theme.applyStyles("light", {
                boxShadow: `
            ${elevation >= 1 ? `${originalShadow},` : ""}
            0px 4px 8px ${theme.alpha(theme.palette.contrast[900], .13)}
        `
            }),
            theme.applyStyles("dark", {
                "&&": {
                    backgroundImage: `
                        ${originalGradient}
                        ${`, ${newGradient}`}
                        ${elevation === 0 ? `, ${lightOverlay}` : "" /*Aclara un poco el elevation=0*/}
        `}
            })]
        })

export default GenericPaper