import { useState } from 'react';
import { LeadComments } from './LeadComments';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material'
import { LeadAuditList } from './LeadAudit';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ height: "100%" }}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

export const LeadActivities = ({ leadId, reloadAudit }: { leadId: number, reloadAudit: number }) => {

  const [openTab, setOpenTab] = useState<number>(0)

  return (
    <Stack sx={{ height: "100%" }} spacing={3}>
      <Typography variant="h2">Actividades</Typography>
      <Stack sx={{ height: "100%" }} spacing={2}>
        <Tabs value={openTab} onChange={(_, val) => { setOpenTab(val) }} aria-label="activities tabs">
          <Tab label="Comentarios" id="tab-comments" />
          <Tab label="Auditoría" id="tab-audit" />
        </Tabs>
        <Box sx={{ height: "100%" }}>
          <CustomTabPanel value={openTab} index={0}>
            <LeadComments leadId={leadId} />
          </CustomTabPanel>
          <CustomTabPanel value={openTab} index={1}>
            <LeadAuditList leadId={leadId} reloadAudit={reloadAudit} />
          </CustomTabPanel>
        </Box>
      </Stack>
    </Stack>
  )
}
