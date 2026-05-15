import { useCallback, useState, useEffect } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import {
    Box,
    Typography,
    IconButton,
    Stack,
    alpha,
    useTheme,
    FormControl,
    FormLabel,
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormErrorMessage } from './FormFeedback';

type FileSubtype = 'FILE_IMAGE' | 'FILE_DOCUMENT' | string | null;

interface FileDropzoneProps {
    label?: string;
    name: string;
    required?: boolean;
    errorMessage?: string;
    subtype?: FileSubtype;
    onChange: (file: File | null) => void;
    value?: File | string | null;
    size?: 'small' | 'medium';
}

const getAcceptedTypes = (subtype: FileSubtype): Accept => {
    switch (subtype) {
        case 'FILE_IMAGE':
            return {
                'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'],
            };
        case 'FILE_DOCUMENT':
            return {
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'application/vnd.ms-excel': ['.xls'],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                'text/plain': ['.txt'],
                'text/csv': ['.csv'],
            };
        default:
            return {};
    }
};

const getAcceptLabel = (subtype: FileSubtype): string => {
    switch (subtype) {
        case 'FILE_IMAGE':
            return 'PNG, JPG, GIF, WEBP, SVG';
        case 'FILE_DOCUMENT':
            return 'PDF, DOC, DOCX, XLS, XLSX, TXT, CSV';
        default:
            return 'Todos los archivos';
    }
};

export const FileDropzone = ({
    label,
    name,
    required = false,
    errorMessage,
    subtype,
    onChange,
    value,
    size = 'medium',
}: FileDropzoneProps) => {
    const theme = useTheme();
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const isImage = subtype === 'FILE_IMAGE';

    // Handle existing value (URL string) or new file
    useEffect(() => {
        if (value instanceof File) {
            setFileName(value.name);
            if (isImage) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(value);
            }
        } else if (typeof value === 'string' && value) {
            // Existing URL
            setFileName(value.split('/').pop() || 'Archivo existente');
            if (isImage) {
                setPreview(value);
            }
        } else {
            setPreview(null);
            setFileName(null);
        }
    }, [value, isImage]);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (file) {
                onChange(file);
            }
        },
        [onChange]
    );

    const handleRemove = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange(null);
            setPreview(null);
            setFileName(null);
        },
        [onChange]
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: getAcceptedTypes(subtype),
        multiple: false,
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    const hasFile = !!preview || !!fileName;
    const isCompact = size === 'small';

    const getBorderColor = () => {
        if (errorMessage) return theme.palette.error.main;
        if (isDragReject) return theme.palette.error.main;
        if (isDragActive) return theme.palette.primary.main;
        return alpha(theme.palette.text.primary, 0.23);
    };

    const getBackgroundColor = () => {
        if (isDragActive && !isDragReject) return alpha(theme.palette.primary.main, 0.08);
        if (isDragReject) return alpha(theme.palette.error.main, 0.08);
        return 'transparent';
    };

    return (
        <FormControl fullWidth error={!!errorMessage}>
            {label && (
                <FormLabel
                    sx={{
                        mb: 0.5,
                        fontSize: isCompact ? '0.75rem' : '0.875rem',
                        color: errorMessage ? 'error.main' : 'text.secondary',
                    }}
                >
                    {label}
                    {required && ' *'}
                </FormLabel>
            )}

            <Box
                {...getRootProps()}
                sx={{
                    border: `1px dashed ${getBorderColor()}`,
                    borderRadius: 2,
                    p: isCompact ? 1.5 : 2.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    backgroundColor: getBackgroundColor(),
                    minHeight: isCompact ? 80 : 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                        borderColor: errorMessage ? theme.palette.error.main : theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                }}
            >
                <input {...getInputProps()} name={name} />

                {hasFile ? (
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            alignItems: 'center',
                            width: '100%',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', overflow: 'hidden' }}>
                            {/* Preview or Icon */}
                            {preview && isImage ? (
                                <Box
                                    component="img"
                                    src={preview}
                                    alt="Vista previa"
                                    sx={{
                                        width: isCompact ? 48 : 64,
                                        height: isCompact ? 48 : 64,
                                        objectFit: 'cover',
                                        borderRadius: 1,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        width: isCompact ? 48 : 64,
                                        height: isCompact ? 48 : 64,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 1,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    }}
                                >
                                    {isImage ? (
                                        <ImageOutlinedIcon color="primary" fontSize={isCompact ? 'medium' : 'large'} />
                                    ) : (
                                        <DescriptionOutlinedIcon color="primary" fontSize={isCompact ? 'medium' : 'large'} />
                                    )}
                                </Box>
                            )}

                            {/* File name */}
                            <Typography
                                variant={isCompact ? 'body2' : 'body1'}
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 200,
                                }}
                                title={fileName || undefined}
                            >
                                {fileName}
                            </Typography>
                        </Stack>

                        {/* Delete button */}
                        <IconButton
                            onClick={handleRemove}
                            size={isCompact ? 'small' : 'medium'}
                            color="error"
                            sx={{
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                                },
                            }}
                        >
                            <DeleteIcon fontSize={isCompact ? 'small' : 'medium'} />
                        </IconButton>
                    </Stack>
                ) : (
                    <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center' }}>
                        <CloudUploadOutlinedIcon
                            sx={{
                                fontSize: isCompact ? 32 : 48,
                                color: isDragActive ? 'primary.main' : 'text.secondary',
                                transition: 'color 0.2s ease-in-out',
                            }}
                        />
                        <Stack spacing={0.25}>
                            <Typography
                                variant={isCompact ? 'body2' : 'body1'}
                                color={isDragActive ? 'primary' : 'text.secondary'}
                            >
                                {isDragActive
                                    ? 'Suelta el archivo aqui'
                                    : 'Arrastra un archivo o haz clic para seleccionar'}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                {getAcceptLabel(subtype)} (max. 10MB)
                            </Typography>
                        </Stack>
                    </Stack>
                )}
            </Box>

            {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
        </FormControl>
    );
};

export default FileDropzone;
