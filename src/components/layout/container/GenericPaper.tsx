import { Paper, styled } from '@mui/material'

//To Do: Estilizar
/** Centraliza los estilos de Paper en el sistema. */
const GenericPaper = styled(Paper)(({ theme }) => {

    const originalGradient = "var(--Paper-overlay)"

    return [{
        paddingInline: "2rem",
        paddingBlock: "1.5rem",
        width: "100%"
    },
    theme.applyStyles("dark", {
        border: `1px solid ${theme.palette.divider}`,
        backgroundImage: `
        ${originalGradient},
        linear-gradient(180deg, ${theme.alpha(theme.palette.contrast[50], .05)},
        ${theme.alpha(theme.palette.contrast[900], .1)})`

    })]
})

export default GenericPaper