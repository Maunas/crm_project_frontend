import { Box, Tab, Tabs } from '@mui/material'
import { useState } from 'react';
import { LeadComments } from './LeadComments';
import { LeadAudit } from './LeadAudit';

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
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const LeadActivities = () => {

  const [openTab, setOpenTab] = useState<number>(0)

  return (
    <>
      <Tabs value={openTab} onChange={(_,val) => { setOpenTab(val) }} aria-label="activities tabs">
        <Tab label="Notas" id="tab-comments" />
        <Tab label="Auditoría" id="tab-audit" />
      </Tabs>
      <CustomTabPanel value={openTab} index={0}>
        <LeadComments />
      </CustomTabPanel>
      <CustomTabPanel value={openTab} index={1}>
        <LeadAudit />
      </CustomTabPanel>
    </>
  )
}
