import { Tooltip } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { CustomAvatar } from './CustomAvatar';

interface UserAvatarProps {
    name: string;
    src?: string;
    size?: number;
    tooltip?: boolean;
    sx?: SxProps<Theme>;
    noRing?: boolean
}

/**
 * Genera siempre el mismo color para el mismo nombre (sin guardar nada en el back). 
 * Saturación y luminosidad fijas (60%/42%) -- solo varía el matiz.
 * Exportado para reusarlo fuera del avatar.
 */
export function nameToColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 42%)`;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const UserAvatar = ({ name, src, size = 36, tooltip = false, noRing = false, sx }: UserAvatarProps) => {
    const color = nameToColor(name);

    const avatar = (
        <CustomAvatar
            color={color}
            src={src}
            variant='circular'
            size="small"
            {...(noRing ? {} : { ring: true })}
            sx={{
                width: size,
                height: size,
                fontSize: size * 0.38,
                fontWeight: 700,
                letterSpacing: 0.5,
                ...sx,
            }}

        >
            {!src && getInitials(name)}
        </CustomAvatar>
    );

    if (tooltip) {
        return <Tooltip title={name}>{avatar}</Tooltip>;
    }

    return avatar;
};
