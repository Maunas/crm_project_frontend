import { Stack, Typography } from "@mui/material";
import type { Metadata } from "src/types/shared";
import { formatDate } from "src/utils/formatters";
import { ChipTooltip } from "./ChipTooltip";
import { UserAvatar } from "./UserAvatar";

interface DetailsMetadataProps<T extends Metadata> {
    entity: T
}

export default function DetailsMetadata<T extends Metadata>({ entity }: DetailsMetadataProps<T>) {
    const hasModifier = entity?.updater && entity.updated_at !== entity.created_at
    const creatorName = entity.creator ? [entity.creator.name, entity.creator.last_name].filter(Boolean).join(" ") : "Sistema"
    const updaterName = entity.updater ? [entity.updater.name, entity.updater.last_name].filter(Boolean).join(" ") : ""
    return (
        <Stack direction="row" spacing={3} useFlexGap
            sx={{ minWidth: "20rem", justifyContent: "space-between", flexWrap: "wrap" }}>
            <MetadataItem title="Creado por" name={creatorName} email={entity.creator?.email} date={entity?.created_at} />
            {hasModifier &&
                <MetadataItem title="Modificado por" name={updaterName} email={entity.updater?.email} date={entity?.updated_at} />
            }
        </Stack>
    );
}

interface MetadataItemProps {
    title?: string,
    name?: string | null,
    email?: string | null,
    date?: string | null,
    short?: boolean,
    noIcon?: boolean,
    small?: boolean,
    noHour?: boolean
}

export const MetadataItem = ({ title, name, email, date, short = false, noIcon = false, small = false, noHour = false }: MetadataItemProps) => {

    const dateFormat = noHour ?
        (short ? "date" : "dateLong")
        : (short ? "dateTime" : "dateTimeLong")

    return (
        <Stack spacing={.5} sx={{ flexGrow: 1 }}>
            {title && !short && <Typography variant="caption" color="textSecondary" sx={{ textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>
                {title}
            </Typography>}
            <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                {name && !noIcon && <UserAvatar name={name} size={small ? 30 : 36} />}
                <Stack>
                    <ChipTooltip title={email} color="secondary" size="small">
                        <Typography variant={small ? "body2" : "body1"} sx={{ fontWeight: 500 }}>
                            {name}
                        </Typography>
                    </ChipTooltip>
                    {date &&
                        <Typography variant="caption" color="textSecondary" sx={{ textTransform: "capitalize" }}>
                            {formatDate(`${date}`, dateFormat)}
                        </Typography>}
                </Stack>
            </Stack>
        </Stack>
    )
}
