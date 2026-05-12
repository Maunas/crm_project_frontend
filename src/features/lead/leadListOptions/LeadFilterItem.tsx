import { alpha, Stack, styled } from '@mui/material'

export const FilterItem = styled(Stack)(
    ({ theme }) => {
        return [
            {
                overflow: "hidden", borderRadius: ".5rem",
                border: `1px solid ${alpha(theme.palette.contrast.light, .5)}`
            },
            {
                "& .delete-filter-btn": [{
                    backgroundColor: alpha(theme.palette.error.light, .3),
                    color: theme.palette.error.darker,
                    borderRadius: 0, minWidth: 0, padding: "1rem",
                    "&:hover": {
                        backgroundColor: alpha(theme.palette.error.light, .4),
                    }
                },
                theme.applyStyles("dark", {
                    backgroundColor: alpha(theme.palette.error.darker, .2),
                    color: theme.palette.error.light,
                    "&:hover": {
                        backgroundColor: alpha(theme.palette.error.darker, .4),
                    }
                })
                ]
            }
        ]
    }
)