import axiosCRM from 'src/lib/axios'
import type { Paginable, ListParams } from 'src/types/shared'
import type { LeadTeam } from 'src/types/leads'

export const getTeams = async (params?: ListParams): Promise<Paginable<LeadTeam>> => {
    const res = await axiosCRM.get('teams', { params })
    return res.data
}
