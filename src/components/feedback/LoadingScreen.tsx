import { CircularProgress, Stack, type StackProps } from '@mui/material'
import type { ReactNode } from 'react'
import GenericPaper from '../layout/container/GenericPaper'

interface LoadingScreenProps extends StackProps {
    loading?: boolean,
    loadingIcon?: ReactNode,
}

export const LoadingScreenWrapper = ({ loading = false, loadingIcon, children }: LoadingScreenProps) => {

    if (loading) return (
        <GenericPaper elevation={0}>
            <Stack sx={{ height: "20rem", alignItems: "center", justifyContent: "center" }}>
                {loadingIcon ?? <CircularProgress />}
            </Stack>
        </GenericPaper>
    )
    return children
}

export default LoadingScreenWrapper