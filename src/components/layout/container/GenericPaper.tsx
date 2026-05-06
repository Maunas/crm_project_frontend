import { Paper, styled } from '@mui/material'

//To Do: Estilizar
/** Centraliza los estilos de Paper en el sistema. */
const GenericPaper = styled(Paper)(() => {
    return [
        { px: 4, py: 3, width: "100%" }
    ]
})

export default GenericPaper