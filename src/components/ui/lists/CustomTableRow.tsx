import { memo } from 'react'
import { TableRow } from '@mui/material'
import { lighten, styled } from '@mui/material/styles'

const TABLE_ROW_SX = { '&:hover': { cursor: "pointer" } }

export const SelectableTableRow = memo(styled(TableRow)(
    ({ theme }) => {
        return (
            [TABLE_ROW_SX,
                {
                    "&:hover":
                        { backgroundColor: lighten(theme.palette.background.paper, .15) },
                }, {
                    "& .table-actions": {
                        opacity: 0,
                    },
                    "&:hover .table-actions": {
                        opacity: 1,
                    }
                }
            ])
    }))
