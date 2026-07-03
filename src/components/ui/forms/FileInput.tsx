import { useState, useRef, useEffect, useCallback, type DragEvent, type ChangeEvent } from "react"
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form"
import { Box, Typography, Stack, Paper, FormControl, useTheme } from "@mui/material"
import { CloudUpload, Description, Image } from "@mui/icons-material"
import CustomChip from "../details/CustomChip"
import { CommonIconButton } from "../buttons/CommonIconButton"
import { decodeUrlFilename } from "src/utils/formatters"
import { showToast } from "src/utils/feedback"

interface FileInputProps<T extends FieldValues> {
    control: Control<T>
    name: Path<T>
    label?: string
    required?: boolean
    errorMessage?: string
    size?: "small" | "medium"
    accept?: string
    multiple?: boolean
    disabled?: boolean
    showPreview?: boolean
}

const isImageFile = (file: File) => file.type.startsWith("image/")

const isFileAccepted = (file: File, accept: string): boolean => {
    if (accept === "*") return true
    const allowed = accept.split(",").map((s) => s.trim())
    return allowed.some((pattern) => {
        if (pattern.startsWith("."))
            return file.name.toLowerCase().endsWith(pattern.toLowerCase())
        if (pattern.endsWith("/*"))
            return file.type.toLowerCase().startsWith(pattern.slice(0, -1).toLowerCase())
        return file.type.toLowerCase() === pattern.toLowerCase()
    })
}

const isImageExtension = (url: string) =>
    /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(url)

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        if (!isImageFile(file)) {
            resolve("")
            return
        }
        const reader = new FileReader()
        reader.onload = (e) => resolve((e.target?.result as string) ?? "")
        reader.readAsDataURL(file)
    })
}

interface FileCardProps {
    file?: File
    existingUrl?: string
    preview?: string
    showPreview: boolean
    onRemove: () => void,
    size?: "small" | "medium"
}

const IMAGE_SIZE = {
    medium: { size: 60, fontSize: 32 },
    small: { size: 40, fontSize: 24 }
}

const FileCard = ({ file, existingUrl, preview, showPreview, onRemove, size = "medium" }: FileCardProps) => {
    const isImage = file ? isImageFile(file) : isImageExtension(existingUrl!)
    const fileName = existingUrl ? decodeUrlFilename(existingUrl) : ""


    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5, gap: 1,
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                bgcolor: "background.paper",
                transition: "border-color 0.2s",
                "&:hover": { borderColor: "primary.main" },
            }}
        >
            <Stack direction="row" sx={{
                alignItems: "center",
                gap: 1.5,
                flexGrow: 1
            }}>
                <Stack
                    sx={{
                        width: IMAGE_SIZE[size].size, height: IMAGE_SIZE[size].size,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 1,
                        bgcolor: "action.hover",
                        overflow: "hidden",
                        flexShrink: 0,
                    }}
                >
                    {isImage && showPreview && (preview || existingUrl) ? (
                        <Box
                            component="img"
                            src={preview ?? existingUrl}
                            sx={{ width: IMAGE_SIZE[size].size, height: IMAGE_SIZE[size].size, objectFit: "cover" }}
                        />
                    ) : isImage ? (
                        <Image color="primary" sx={{ fontSize: IMAGE_SIZE[size].fontSize }} />
                    ) : (
                        <Description color="action" sx={{ fontSize: IMAGE_SIZE[size].fontSize }} />
                    )}
                </Stack>
                <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                    {size === "medium" &&
                        <>
                            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                                {file ? file.name : fileName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {file ? formatFileSize(file.size) : "Archivo Existente"}
                            </Typography>
                            <CustomChip
                                label={isImage ? "Imagen" : "Documento"}
                                size="small"
                                color={isImage ? "primary" : "secondary"}
                                variant="outlined"
                                sx={{ width: "fit-content" }}
                            />
                        </>}
                </Stack>
                <CommonIconButton actionType="DISABLE" size="small" color="error" onClick={onRemove}
                    title="Quitar" tooltipSize="small" />
            </Stack>
            {size === "small" &&
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                    <>
                        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                            {file ? file.name : fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {file ? formatFileSize(file.size) : "Archivo Existente"}
                        </Typography>
                    </>
                </Stack>}
        </Paper>
    )
}

export const FileInput = <T extends FieldValues>({
    control, name, label, required = false, errorMessage, size,
    accept = "*", multiple = false, disabled = false, showPreview = false,
}: FileInputProps<T>) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => {
                const existingUrl = typeof field.value === "string" && field.value ? field.value : undefined

                return (
                    <FileInputInner
                        label={label}
                        required={required}
                        errorMessage={errorMessage}
                        size={size}
                        accept={accept}
                        multiple={multiple}
                        disabled={disabled}
                        showPreview={showPreview}
                        existingUrl={existingUrl}
                        onFormChange={(fileList) => field.onChange(fileList)}
                    />
                )
            }}
        />
    )
}

interface FileInputInnerProps {
    label?: string
    required: boolean
    errorMessage?: string
    size?: "small" | "medium"
    accept: string
    multiple: boolean
    disabled: boolean
    showPreview: boolean
    existingUrl?: string
    onFormChange: (value: FileList | null) => void
}

const FileInputInner = ({
    label, required, errorMessage, size,
    accept, multiple, disabled, showPreview, existingUrl, onFormChange,
}: FileInputInnerProps) => {
    const [files, setFiles] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map())
    const [isDragOver, setIsDragOver] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const filesRef = useRef(files)
    useEffect(() => { filesRef.current = files }, [files])

    const hasExistingUrl = existingUrl !== undefined && existingUrl !== null
    const empty = files.length === 0 && !hasExistingUrl

    const { palette } = useTheme()

    const dropZoneBorderColor = isDragOver
        ? palette.primary.main
        : errorMessage
            ? palette.error.main
            : palette.divider

    const syncFormValue = useCallback(
        (updatedFiles: File[]) => {
            if (updatedFiles.length === 0 && !hasExistingUrl) {
                onFormChange(null)
                return
            }
            if (updatedFiles.length === 0) return
            const dt = new DataTransfer()
            updatedFiles.forEach((f) => dt.items.add(f))
            onFormChange(dt.files)
        },
        [hasExistingUrl, onFormChange],
    )

    const addFiles = useCallback(
        (newFiles: File[]) => {
            const current = filesRef.current
            const combined = multiple ? [...current, ...newFiles] : [newFiles[0]]
            setFiles(combined)
            syncFormValue(combined)

            if (showPreview) {
                for (const file of newFiles) {
                    if (isImageFile(file)) {
                        readFileAsDataURL(file).then((url) => {
                            setPreviewUrls((prev) => {
                                const next = new Map(prev)
                                next.set(file.name, url)
                                return next
                            })
                        })
                    }
                }
            }
        },
        [multiple, showPreview, syncFormValue],
    )

    const handleNativeChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const selected = Array.from(e.target.files ?? [])
            if (selected.length === 0) return
            if (!multiple && existingUrl) onFormChange(null)
            addFiles(selected)
        },
        [addFiles, existingUrl, multiple, onFormChange],
    )

    const handleDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setIsDragOver(false)
            if (disabled) return
            const dropped = Array.from(e.dataTransfer.files)
            if (dropped.length === 0) return
            if (accept !== "*") {
                const rejected = dropped.filter((f) => !isFileAccepted(f, accept))
                if (rejected.length > 0) {
                    showToast(
                        `Archivo(s) no aceptado(s): ${rejected.map((f) => f.name).join(", ")}`,
                        "warning",
                    )
                }
            }
            const valid = accept === "*" ? dropped : dropped.filter((f) => isFileAccepted(f, accept))
            if (valid.length === 0) return
            if (!multiple && existingUrl) onFormChange(null)
            addFiles(valid)
        },
        [disabled, addFiles, accept, existingUrl, multiple, onFormChange],
    )

    const handleDragOver = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            if (!disabled) setIsDragOver(true)
        },
        [disabled],
    )

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false)
    }, [])

    const handleClick = useCallback(() => {
        if (!disabled) inputRef.current?.click()
    }, [disabled])

    const handleRemove = useCallback(
        (fileToRemove: File) => {
            const filtered = filesRef.current.filter((f) => f !== fileToRemove)
            setFiles(filtered)
            syncFormValue(filtered)
            setPreviewUrls((prev) => {
                const next = new Map(prev)
                next.delete(fileToRemove.name)
                return next
            })
        },
        [syncFormValue],
    )

    const handleRemoveExisting = useCallback(() => {
        onFormChange(null)
    }, [onFormChange])

    const setInputRef = useCallback((e: HTMLInputElement | null) => {
        if (e) inputRef.current = e
    }, [])

    return (
        <FormControl error={!!errorMessage} fullWidth size={size ?? "medium"} disabled={disabled}>
            {label && (
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75 }}>
                    {label} {required && "*"}
                </Typography>
            )}

            <input
                ref={setInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                style={{ display: "none" }}
                onChange={handleNativeChange}
                disabled={disabled}
            />

            {empty ? (
                <Box
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    sx={{
                        border: `2px dashed ${dropZoneBorderColor}`,
                        borderRadius: 3,
                        p: size === "medium" ? 3 : 1,
                        textAlign: "center",
                        bgcolor: isDragOver ? "action.hover" : "transparent",
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.5 : 1,
                        transition: "background-color 0.2s, border-color 0.2s",
                        "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                    }}
                >
                    <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                        <CloudUpload sx={{ fontSize: size === "medium" ? 36 : 24, color: "primary.main" }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {size === "medium" ?
                                `Haz clic para subir ${multiple ? "archivos" : "un archivo"} o arrastra y suelta`
                                : `Subir Archivo${multiple ? "s" : ""}`
                            }
                        </Typography>
                    </Stack>
                </Box>
            ) : (
                <Stack
                    spacing={1}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    sx={{
                        minHeight: 60,
                        border: isDragOver ? "2px dashed" : "2px dashed transparent",
                        borderColor: isDragOver ? "primary.main" : "transparent",
                        borderRadius: 2,
                        p: 0.5,
                        transition: "border-color 0.2s, background-color 0.2s",
                        bgcolor: isDragOver ? "action.hover" : "transparent",
                    }}
                >
                    {multiple && (
                        <Box
                            onClick={handleClick}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            sx={{
                                border: `2px dashed ${dropZoneBorderColor}`,
                                borderRadius: 3,
                                p: size === "medium" ? 3 : 1,
                                textAlign: "center",
                                bgcolor: isDragOver ? "action.hover" : "transparent",
                                cursor: disabled ? "not-allowed" : "pointer",
                                opacity: disabled ? 0.5 : 1,
                                transition: "background-color 0.2s, border-color 0.2s",
                                "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                            }}
                        >
                            <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                                <CloudUpload sx={{ fontSize: size === "medium" ? 36 : 24, color: "primary.main" }} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {size === "medium" ?
                                        `Haz clic para subir ${multiple ? "archivos" : "un archivo"} o arrastra y suelta`
                                        : `Subir Archivo${multiple ? "s" : ""}`
                                    }
                                </Typography>
                            </Stack>
                        </Box>
                    )}
                    {hasExistingUrl && (
                        <FileCard existingUrl={existingUrl} showPreview={showPreview} onRemove={handleRemoveExisting} size={size} />
                    )}
                    {files.map((file, idx) => (
                        <FileCard
                            key={`${file.name}-${idx}`}
                            file={file}
                            preview={previewUrls.get(file.name)}
                            showPreview={showPreview}
                            onRemove={() => handleRemove(file)} size={size}
                        />
                    ))}
                </Stack>
            )}

            {errorMessage && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                    {errorMessage}
                </Typography>
            )}
        </FormControl>
    )
}

export default FileInput