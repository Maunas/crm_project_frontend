import { useEffect, useMemo, useState } from "react"
import type { LeadAudit } from "../../../../types/leads"
import { getAudit } from "./leadActivitiesService"
import type { Paginable } from "../../../../types/common"
import { Avatar, Card, CardActionArea, CardActions, CardContent, CardHeader, Collapse, Divider, Grid, Stack, Typography } from "@mui/material"
import { CustomChip } from "../../../common/details/StyledDisplayComponents"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import { CustomListItemAvatar } from "../../../common/lists/CustomListItem"
import type { ColorTypes } from "../../../../types/mui-theme.d"
import { MetadataShort } from "./LeadComments"
import { useListPagination } from "../../../hooks/useListPagination"
import { PaginationComponent } from "../../../common/lists/PaginationComponent"
import Timeline from '@mui/lab/Timeline';
import { CustomTimelineItem } from "../../../common/layout/MinorComponents"
import { timelineItemClasses } from "@mui/lab/TimelineItem"

export const LeadAuditList = ({ leadId, reloadAudit }: { leadId: number, reloadAudit: number }) => {

  const [audit, setAudit] = useState<Paginable<LeadAudit> | null>(null)

  const { fetchPage, pageSize, pageComponentProps } = useListPagination(audit, 8)

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

  const [showItem, setShowItem] = useState<number>(0)

  if (audit) return (
    <Stack spacing={2} sx={{ height: "100%" }}>
      <Timeline sx={{
        flexGrow: 1,
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}>
        {audit.items.map((item, idx) => {
          return (
            <CustomTimelineItem selected={idx === showItem} last={idx === audit.items.length - 1} key={item.id}>
              <Card raised>
                <CardActionArea onClick={() => setShowItem(idx)} title="Ver detalle">
                  <LeadAuditHeader activityType={item.activity_type}
                    message={item.details.message ?? `${item.details?.changes?.length ?? 0} cambios`} />
                </CardActionArea>
                <Collapse in={idx === showItem} timeout="auto" unmountOnExit>
                  <Divider />
                  {item.details.changes &&
                    <CardContent sx={{ py: 1 }}>
                      <Grid container rowSpacing={1} columnSpacing={.5} sx={{ alignItems: "center" }}>
                        {item.details.changes.map(change =>
                          <Grid size="grow" key={`${item.id}-${change.field_id}`} sx={{ minWidth: "15rem", alignItems: "center" }}>
                            <Stack direction="row" spacing={1} sx={{ px: 2, alignItems: "center" }}>
                              <Typography variant="body2">{change.field_name}:</Typography>
                              <LeadAuditValue value={change.old_value} color="error" size="small" fieldName={change.field_name} />
                              <ArrowForwardIcon />
                              <LeadAuditValue value={change.new_value} color="success" fieldName={change.field_name} />
                            </Stack>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  }
                  <Divider />
                  <CardActions sx={{ py: .5 }}>
                    <Stack direction="row" spacing={.5} sx={{ alignItems: "center", justifyContent: "end", ml: "auto" }}>
                      <WatchLaterIcon fontSize="small" />
                      <MetadataShort metadata={item} noIcon containerProps={{ sx: { marginRight: ".5rem" } }} />
                    </Stack>
                  </CardActions>
                </Collapse>
              </Card>
            </CustomTimelineItem>
          )
        })}
      </Timeline>
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
        { icon: <AddIcon />, color: "success", title: "Nuevo Lead" }
      )
      default: return (
        { icon: <InfoOutlinedIcon />, color: "warning", title: "Otro" }
      )
    }
  }, [activityType])
  return (
    <CardHeader sx={{ py: 1 }}
      avatar={<CustomListItemAvatar color={activityInfo?.color} >
        <Avatar variant="rounded" sx={{ height: "2rem", width: "2rem", mx: "auto" }}>
          {activityInfo?.icon}
        </Avatar>
      </CustomListItemAvatar>}
      title={<Typography variant="body2" sx={{ fontWeight: 600 }}>
        {activityInfo.title}
      </Typography>}
      subheader={message}
    />
  )
}


interface LeadAuditValueProps {
  value: string | number[] | null,
  fieldName: string,
  size?: "small" | "medium" | "large" | "xlarge",
  color?: ColorTypes
}

const showValue = (val: string | number[] | null, name: string) => {
  if (!val) return name
  return val.length > 50 ? name : val
}

const LeadAuditValue = ({ value, fieldName, size = "medium", color = "primary" }: LeadAuditValueProps) => {

  if (typeof value === "number") {
    return <CustomChip size={size} color={color} label={value} />
  }
  if (typeof value === "string") {
    return <CustomChip size={size} color={color} label={showValue(value, fieldName)} />
  }
  return <Stack spacing={.5} sx={{ flexWrap: "wrap", direction: "row", justifyContent: "center" }}>
    {value?.map(item =>
      <CustomChip size={size} color={color} label={showValue(`${item}`, fieldName)} />
    )}
  </Stack>
}