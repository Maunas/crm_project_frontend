import { useEffect, useMemo, useState } from "react"
import type { LeadAudit } from "../../../../types/leads"
import { getAudit } from "./leadActivitiesService"
import type { Paginable } from "../../../../types/common"
import { Avatar, Card, CardActions, CardContent, CardHeader, Divider, Grid, Stack, Typography } from "@mui/material"
import { CustomChip } from "../../../common/details/StyledDisplayComponents"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import EditIcon from "@mui/icons-material/Edit"
import CreateIcon from "@mui/icons-material/Create"
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import { CustomListItemAvatar } from "../../../common/lists/CustomListItem"
import type { ColorTypes } from "../../../../types/mui-theme.d"
import { MetadataShort } from "./LeadComments"
import { useListPagination } from "../../../hooks/useListPagination"
import { PaginationComponent } from "../../../common/lists/PaginationComponent"

export const LeadAuditList = ({ leadId, reloadAudit }: { leadId: number, reloadAudit: number }) => {

  const [audit, setAudit] = useState<Paginable<LeadAudit> | null>(null)

  const { fetchPage, pageSize, pageComponentProps } = useListPagination(audit, 5)

  const fetchAuditList = (leadId: number, fetchPage: number, pageSize: number) => {
    if (!leadId) return
    getAudit({ lead_id: leadId, page: fetchPage, page_size: pageSize }).then(setAudit)
  }

  useEffect(() => {
    fetchAuditList(leadId, fetchPage, pageSize)
  }, [leadId, fetchPage, pageSize])

  //Recarga cuando hay un cambio. No lo hace si no han habido cambios.
  useEffect(() => {
    if (leadId && reloadAudit === 0) return
    fetchAuditList(leadId, fetchPage, pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadAudit])

  if (audit) return (
    <Stack gap={2}>
      {
        audit.items.map(item => {
          return <Card key={item.id} raised>
            <LeadAuditHeader activityType={item.activity_type}
              message={item.details.message ?? `${item.details?.changes?.length ?? 0} cambios`} />
            <Divider />
            {item.details.changes &&
              <CardContent sx={{ py: 1 }}>
                <Grid container rowGap={1} columnGap={.5}>
                  {item.details.changes.map(change =>
                    <Grid size="grow" key={`${item.id}-${change.field_id}`} minWidth="15rem">
                      <Stack direction="row" gap={1} alignItems="center" sx={{ px: "1rem" }}>
                        <Typography variant="body2">{change.field_name}:</Typography>
                        <LeadAuditValue value={change.old_value} color="error" size="small" />
                        <ArrowForwardIcon />
                        <LeadAuditValue value={change.new_value} color="success" />
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            }
            <Divider />
            <CardActions sx={{ py: .5 }}>
              <Stack direction="row" marginInlineStart="auto" gap={.5} alignItems="center" justifyContent="end">
                <WatchLaterIcon fontSize="small" />
                <MetadataShort metadata={item} noIcon containerProps={{ sx: { marginRight: ".5rem" } }} />
              </Stack>
            </CardActions>
          </Card>
        }
        )
      }
      <PaginationComponent {...pageComponentProps} />
    </Stack >
  )
}


interface ActivityInfoProps {
  icon: React.ReactNode,
  color: ColorTypes,
  title: string
}


const LeadAuditHeader = ({ activityType, message }: { activityType?: string, message: string }) => {

  const activityInfo = useMemo<ActivityInfoProps>(() => {
    switch (activityType) {
      case "FIELDS_UPDATED": return (
        { icon: <EditIcon />, color: "info", title: "Actualización de datos" }
      )
      case "LEAD_CREATED": return (
        { icon: <CreateIcon />, color: "success", title: "Nuevo Lead" }
      )
      default: return (
        { icon: <InfoOutlinedIcon />, color: "warning", title: "Otro" }
      )
    }
  }, [activityType])
  return (
    <CardHeader sx={{ py: .5, pt: 1 }}
      avatar={<CustomListItemAvatar color={activityInfo?.color} >
        <Avatar variant="rounded" sx={{ height: "2rem", width: "2rem", mx: "auto" }}>
          {activityInfo?.icon}
        </Avatar>
      </CustomListItemAvatar>}
      title={<Typography variant="body2" fontWeight={600}>
        {activityInfo.title}
      </Typography>}
      subheader={message}
    />
  )
}

interface LeadAuditValueProps {
  value: string | number[] | null,
  size?: "small" | "medium" | "large" | "xlarge",
  color?: ColorTypes
}

const LeadAuditValue = ({ value, size = "medium", color = "primary" }: LeadAuditValueProps) => {
  if (typeof value === "string") {
    return <CustomChip size={size} color={color} label={value} />
  }
  return <Stack gap={.5} flexWrap="wrap" direction="row" justifyContent="center">
    {value?.map(item =>
      <CustomChip size={size} color={color} label={item} />
    )}
  </Stack>

}