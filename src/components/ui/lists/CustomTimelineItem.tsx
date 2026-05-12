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
