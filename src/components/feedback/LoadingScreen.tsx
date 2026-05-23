import { CircularProgress, Stack, type StackProps } from '@mui/material'
import type { ReactNode } from 'react'

interface LoadingScreenProps extends StackProps {
    loading?: boolean,
    loadingIcon?: ReactNode,
}

export const LoadingScreenWrapper = ({ loading = false, loadingIcon, children }: LoadingScreenProps) => {

    if (loading) return (
        <Stack sx={{ height: "30rem", alignItems: "center", justifyContent: "center" }}>
            {loadingIcon ?? <CircularProgress />}
        </Stack>
    )
    return <>{children}</>
}

export default LoadingScreenWrapper