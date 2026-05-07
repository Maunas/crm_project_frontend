import { useEffect, useMemo, useState } from "react"
import type { LeadAudit } from "../../../types/leads"
import { getAudit } from "./leadActivitiesService"
import type { Paginable } from "../../../types/shared"
import { Avatar, Box, Button, Card, CardActionArea, CardActions, CardContent, CardHeader, Collapse, Divider, Stack, Typography } from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import { CustomListItemAvatar } from "../../../components/ui/lists/CustomListItem"
import type { ColorTypes } from "../../../types/mui-theme.d"
import { MetadataShort } from "./LeadComments"
import { useListPagination } from "../../../hooks/useListPagination"
import PaginationComponent from "src/components/ui/lists/PaginationComponent"
import Timeline from '@mui/lab/Timeline';
import { timelineItemClasses } from "@mui/lab/TimelineItem"
import CustomChip from "src/components/ui/details/CustomChip"
import { CustomTimelineItem } from "src/components/ui/lists/CustomTimelineItem"

const MAX_ITEMS_NUM = 3

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

  const [showItems, setShowItems] = useState<number>(0)

  const [showMoreItems, setShowMoreItems] = useState<boolean>(false)

  const handleShowItems = (idx: number) => {
    setShowItems(idx)
    setShowMoreItems(false)
  }

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
            <CustomTimelineItem selected={idx === showItems} last={idx === audit.items.length - 1} key={item.id}>
              <Card raised>
                <CardActionArea onClick={() => handleShowItems(idx)} title="Ver detalle">
                  <LeadAuditHeader activityType={item.activity_type}
                    message={item.details.message ?? `${Object.values(item.details?.changes ?? {}).length} cambios`} />
                </CardActionArea>
                <Collapse in={idx === showItems} timeout="auto" unmountOnExit>
                  <Divider />
                  {item?.details?.changes &&
                    <CardContent sx={{ py: 1 }}>
                      <Stack spacing={1} useFlexGap sx={{ alignItems: "start" }}>
                        {Object.entries(item.details.changes).map(([field_id, change], idx) => {
                          if (!showMoreItems && idx >= MAX_ITEMS_NUM) return null

                          return (
                            <Stack spacing={1} key={`audit-${item.id}-${field_id}`} sx={{ alignItems: "start" }}>
                              <Typography variant="body2" sx={{ fontWeight: "bold" }}>{change.field_name}:</Typography>
                              <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: "wrap", px: 1, alignItems: "center" }}>
                                <Box>
                                  <LeadAuditValue value={change.old_value} id={item.id} color="error" size="small" fieldName={change.field_name} />
                                </Box>
                                <ArrowForwardIcon fontSize="small" />
                                <Box>
                                  <LeadAuditValue value={change.new_value} id={item.id} color="success" size="small" fieldName={change.field_name} />
                                </Box>
                              </Stack>
                            </Stack>
                          )
                        })}
                        {!showMoreItems && Object.values(item.details.changes)?.length > MAX_ITEMS_NUM &&
                          <Button sx={{ mx: "auto" }} onClick={() => setShowMoreItems(true)}>Ver más</Button>
                        }
                      </Stack>
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
  value: string | number | number[] | null,
  fieldName: string,
  size?: "small" | "medium" | "large" | "xlarge",
  color?: ColorTypes,
  id: number
}

const showValue = (val: string | number | number[] | null, name: string) => {
  if (typeof val === "number") return val
  if (!val) return name
  return val.length > 50 ? name : val
}

const chipSx = {
  minWidth: "4rem",
  maxWidth: "12rem"
}

const LeadAuditValue = ({ value, fieldName, id, size = "medium", color = "primary" }: LeadAuditValueProps) => {
  if (!value) {
    return <CustomChip size={size} color={color} label="---" title="Sin valor" sx={chipSx} />
  }
  if (typeof value === "number") {
    return <CustomChip size={size} color={color} label={value} title={`${value}`} sx={chipSx} />
  }
  if (typeof value === "string") {
    return <CustomChip size={size} color={color} label={showValue(value, fieldName)} title={value} sx={chipSx} />
  }
  return <Stack spacing={.5} direction="row" useFlexGap sx={{ flexWrap: "wrap", direction: "row", justifyContent: "start" }}>
    {value?.map(item =>
      <CustomChip size={size} color={color} key={`audit-value-${id}-${value}`} label={showValue(`${item}`, fieldName)} title={`${item}`} sx={chipSx} />
    )}
  </Stack>
}