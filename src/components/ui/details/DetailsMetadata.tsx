import { Grid, Typography } from "@mui/material";
import type { Metadata } from "src/types/shared";
import { formatDate } from "src/utils/formatters";

interface DetailsMetadataProps<T extends Metadata> {
    entity: T
}

export default function DetailsMetadata<T extends Metadata>({ entity }: DetailsMetadataProps<T>) {
    return (<Grid container spacing={1} size="grow"
        sx={{ minWidth: "20rem" }}>
        <Grid size="grow" sx={{ minWidth: "18rem" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Fecha de creación:
            </Typography>
            <Typography variant="body1" sx={{ textTransform: "capitalize", pl: 2 }}>
                {formatDate(entity?.created_at, "dateTimeLong")}
            </Typography>
        </Grid>
        {entity?.updated_at &&
            <Grid size="grow" sx={{ minWidth: "18rem" }}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    Fecha de última modificación:
                </Typography>
                <Typography variant="body1" sx={{ textTransform: "capitalize", pl: 2 }}>
                    {formatDate(entity.updated_at, "dateTimeLong")}
                </Typography>
            </Grid>
        }
    </Grid>);
}