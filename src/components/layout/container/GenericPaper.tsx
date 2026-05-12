import { styled } from '@mui/material/styles'
import { Paper } from '@mui/material'

//To Do: Estilizar
/** Centraliza los estilos de Paper en el sistema. */
const GenericPaper = styled(Paper)(() => {
    return [{
        paddingInline: "2rem",
        paddingBlock: "1.5rem",
        width: "100%"
    }]
})

export default GenericPaper