import React, { useEffect, useState } from 'react'
import type { Lead } from '../../types/leads'
import { getLeads } from './leadService'
import { Button, Pagination } from '@mui/material'
import { Link } from 'react-router-dom'
import type { Paginable } from '../../types/common'

export const LeadList = () => {

    const [leads, setLeads] = useState<Paginable<Lead[]> | null>(null)

    useEffect(() => {
        getLeads({ only_active: false }).then(setLeads)
    }, [])

    const [page, setPage] = useState<number>(1)
    const handlePage = (e: React.ChangeEvent<unknown>, value: number) => {
        if (value === page) return
        getLeads({ only_active: false, page: value }).then((res) => {
            setPage(value)
            setLeads(res)
        })
    }
    return (
        <>
            {leads?.items?.length > 0 &&
                leads.items.map(lead => 
                <Button component={Link} to={`/leads/${lead.id}`} key={lead.id}>
                    {`${lead.field_values?.[0]?.value} ${lead.field_values?.[1]?.value}`}
                    </Button>)
            }
            <Pagination page={page} onChange={handlePage} count={leads?.total_pages} color="secondary" />
        </>
    )
}
