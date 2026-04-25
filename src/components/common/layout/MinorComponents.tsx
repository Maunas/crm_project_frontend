import Stack from '@mui/material/Stack'
import { CustomChip } from '../details/StyledDisplayComponents'

interface DetailsTitleProps {
    active: boolean,
    children?: React.ReactNode,
}

export const TitleAndActive = ({ active, children }: DetailsTitleProps) => {
    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", width: "100%", flexGrow: 1 }}>
            {children}
            {
                active ? <CustomChip sx={{ marginLeft: "auto" }} color='success' label="Habilitado" /> :
                    <CustomChip sx={{ marginLeft: "auto" }} color='error' label="Deshabilitado" />
            }
        </Stack >
    )
}

import React from 'react'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineContent from '@mui/lab/TimelineContent'

export const CustomTimelineItem = ({ selected = false, last = false, children }: { selected?: boolean, last?: boolean, children?: React.ReactNode }) => {
    return (
        <TimelineItem>
            <TimelineSeparator>
                <TimelineDot color={selected ? "primary" : "grey"} />
                {!last && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>{children}</TimelineContent>
        </TimelineItem>
    )
}
