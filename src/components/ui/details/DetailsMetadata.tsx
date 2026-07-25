import { Divider, Grid, Stack, Tooltip, Typography } from "@mui/material";
import type { Metadata } from "src/types/shared";
import { formatDate, formatUserFullName } from "src/utils/formatters";
import PersonIcon from '@mui/icons-material/Person';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import ACTION_ICONS from "../buttons/ActionIcons";
import type { ReactNode } from "react";
import { ChipTooltip } from "./ChipTooltip";
import { UserAvatar } from "./UserAvatar";

interface DetailsMetadataProps<T extends Metadata> {
    entity: T
}

export default function DetailsMetadata<T extends Metadata>({ entity }: DetailsMetadataProps<T>) {
    const hasModifier = entity?.updater && entity.updated_at !== entity.created_at
    const creatorName = entity.creator ? [entity.creator.name, entity.creator.last_name].filter(Boolean).join(" ") : ""
    const updaterName = entity.updater ? [entity.updater.name, entity.updater.last_name].filter(Boolean).join(" ") : ""
    return (
        <Stack direction="row" spacing={3} useFlexGap divider={<Divider orientation="vertical" flexItem />}
            sx={{ minWidth: "20rem", justifyContent: "space-between", flexWrap: "wrap" }}>
            <MetadataItem title="Creado por" name={creatorName} email={entity.creator?.email} date={entity?.created_at} icon={ACTION_ICONS.PERSON_OUTLINE} />
            {hasModifier &&
                <MetadataItem title="Modificado por" name={updaterName} email={entity.updater?.email} date={entity?.updated_at} icon={ACTION_ICONS.MODIFY} />
            }
        </Stack>
    );
}

export const MetadataItem = ({ title, name, email, date }: { title: string, name?: string | null, email?: string | null, date?: string | null, icon?: ReactNode }) => {
    return (
        <Stack spacing={.5} sx={{ flex: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>
                {title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                {name && <UserAvatar name={name} />}
                <Stack>
                    <ChipTooltip title={email} color="secondary" size="small">
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {name}
                        </Typography>
                    </ChipTooltip>
                    {date &&
                        <Typography variant="caption" color="textSecondary" sx={{ textTransform: "capitalize" }}>
                            {formatDate(`${date}`, "dateTimeLong")}
                        </Typography>}
                </Stack>
            </Stack>
        </Stack>
    )
}



interface MetadataShortProps {
    metadata: Metadata,
    onlyUser?: boolean,
    onlyDate?: boolean,
    noIcon?: boolean,
    containerProps?: object
}
/**
 * Versión de una sola linea.
 * Muestra los datos de la última modificación, o creación si no se ha modificado.
 * */
export const MetadataShort = ({ metadata, onlyUser = false, onlyDate = false, noIcon = false, containerProps }: MetadataShortProps) => {
    const user = metadata?.updater ?? metadata?.creator ?? null
    const userDisplay = formatUserFullName(user) ?? "Sistema"

    return (
        <Grid spacing={.5} container sx={{ alignItems: "center" }} {...containerProps}>
            {!onlyDate &&
                <Stack direction="row" spacing={.5}>
                    {!noIcon && <PersonIcon fontSize="small" />}
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>Por</Typography>
                    <Tooltip title={user?.email ?? ""} disableHoverListener={!user?.email}>
                        <Typography variant="body2">{userDisplay}</Typography>
                    </Tooltip>
                </Stack>
            }
            {(!onlyDate && !onlyUser) && "-"}
            {!onlyUser &&
                <Stack direction="row" spacing={.5}>
                    {!noIcon && <WatchLaterIcon fontSize="small" />}
                    <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                        {formatDate(metadata?.updated_at ?? metadata?.created_at, "dateTimeLong")}
                    </Typography>
                </Stack>
            }
        </Grid>
    )
}