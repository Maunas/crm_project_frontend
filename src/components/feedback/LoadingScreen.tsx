import { CircularProgress, Stack, type StackProps } from '@mui/material'
import type { ReactNode } from 'react'
import GenericPaper from '../layout/container/GenericPaper'

interface LoadingScreenProps extends StackProps {
    loading?: boolean,
    loadingIcon?: ReactNode,
}

export const LoadingScreenWrapper = ({ loading = false, loadingIcon, children, ...props }: LoadingScreenProps) => {

    if (loading) return (
        <Stack component={GenericPaper} elevation={0} {...props} sx={{ height: "20rem", alignItems: "center", justifyContent: "center", ...props.sx }}>
            {loadingIcon ?? <CircularProgress />}
        </Stack>
    )
    return children
}

export default LoadingScreenWrapper