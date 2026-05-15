import type { SxProps, Theme } from "@mui/material";

// Consistent field styling for all form inputs
export const fieldSx: SxProps<Theme> = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.03)' 
                : 'rgba(0,0,0,0.01)',
        },
        '&.Mui-focused': {
            backgroundColor: 'background.paper',
            boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}20`,
        },
        '& fieldset': {
            borderColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.12)' 
                : 'rgba(0,0,0,0.12)',
            transition: 'border-color 0.2s ease-in-out',
        },
        '&:hover fieldset': {
            borderColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.25)' 
                : 'rgba(0,0,0,0.25)',
        },
        '&.Mui-focused fieldset': {
            borderWidth: '2px',
        },
        '&.Mui-error fieldset': {
            borderColor: 'error.main',
        },
    },
    '& .MuiInputLabel-root': {
        fontWeight: 500,
        '&.Mui-focused': {
            color: 'primary.main',
        },
    },
    '& .MuiInputBase-input': {
        padding: '14px 16px',
    },
    '& .MuiInputBase-inputSizeSmall': {
        padding: '10px 14px',
    },
};

// For FormControl components (Money, Password, etc.)
export const formControlSx: SxProps<Theme> = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.03)' 
                : 'rgba(0,0,0,0.01)',
        },
        '&.Mui-focused': {
            backgroundColor: 'background.paper',
            boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}20`,
        },
        '& fieldset': {
            borderColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.12)' 
                : 'rgba(0,0,0,0.12)',
            transition: 'border-color 0.2s ease-in-out',
        },
        '&:hover fieldset': {
            borderColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.25)' 
                : 'rgba(0,0,0,0.25)',
        },
        '&.Mui-focused fieldset': {
            borderWidth: '2px',
        },
    },
    '& .MuiInputLabel-root': {
        fontWeight: 500,
        '&.Mui-focused': {
            color: 'primary.main',
        },
    },
};

// For switch/checkbox containers
export const switchContainerSx: SxProps<Theme> = {
    borderRadius: '12px',
    backgroundColor: 'background.paper',
    border: (theme) => `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(255,255,255,0.12)' 
        : 'rgba(0,0,0,0.12)'}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        borderColor: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.25)' 
            : 'rgba(0,0,0,0.25)',
        backgroundColor: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.03)' 
            : 'rgba(0,0,0,0.01)',
    },
};

// For slider containers
export const sliderContainerSx: SxProps<Theme> = {
    p: 2,
    borderRadius: '12px',
    backgroundColor: 'background.paper',
    border: (theme) => `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(255,255,255,0.12)' 
        : 'rgba(0,0,0,0.12)'}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        borderColor: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.25)' 
            : 'rgba(0,0,0,0.25)',
    },
};

// For number field with spinner
export const numberFieldSx: SxProps<Theme> = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.03)' 
                : 'rgba(0,0,0,0.01)',
        },
        '&.Mui-focused': {
            backgroundColor: 'background.paper',
            boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}20`,
        },
        '& fieldset': {
            borderColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.12)' 
                : 'rgba(0,0,0,0.12)',
        },
        '&:hover fieldset': {
            borderColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.25)' 
                : 'rgba(0,0,0,0.25)',
        },
        '&.Mui-focused fieldset': {
            borderWidth: '2px',
        },
    },
    '& .MuiInputLabel-root': {
        fontWeight: 500,
    },
    '& .MuiIconButton-root': {
        borderRadius: '8px',
        transition: 'all 0.15s ease-in-out',
        '&:hover': {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
        },
    },
};

// For autocomplete
export const autocompleteSx: SxProps<Theme> = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.03)' 
                : 'rgba(0,0,0,0.01)',
        },
        '&.Mui-focused': {
            backgroundColor: 'background.paper',
            boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}20`,
        },
        '& fieldset': {
            borderColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.12)' 
                : 'rgba(0,0,0,0.12)',
            transition: 'border-color 0.2s ease-in-out',
        },
        '&:hover fieldset': {
            borderColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.25)' 
                : 'rgba(0,0,0,0.25)',
        },
        '&.Mui-focused fieldset': {
            borderWidth: '2px',
        },
    },
    '& .MuiInputLabel-root': {
        fontWeight: 500,
        '&.Mui-focused': {
            color: 'primary.main',
        },
    },
    '& .MuiAutocomplete-popupIndicator': {
        transition: 'transform 0.2s ease-in-out',
    },
    '& .MuiAutocomplete-clearIndicator': {
        transition: 'opacity 0.2s ease-in-out',
    },
};
