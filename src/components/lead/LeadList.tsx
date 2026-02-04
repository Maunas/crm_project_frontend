import React, { useEffect, useState } from 'react'
import type { Lead } from '../../types/leads'
import { getLeads } from './leadService'
import { Button } from '@mui/material'
import { Link } from 'react-router-dom'

export const LeadList = () => {

    const [leads, setLeads] = useState<Lead[]>(null)

    useEffect(() => {
        getLeads().then(setLeads)
    }, [])

    return (
        <>
            {leads?.length > 0 &&
                leads.map(lead=> <Button component={Link} to={`/leads/${lead.id}`}>{`${lead.field_values[0].value} ${lead.field_values[1].value}`}</Button>)
            }
        </>
    )
}
