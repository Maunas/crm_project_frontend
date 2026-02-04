import { useEffect, useState } from 'react'
import type { LeadFieldDetailed } from '../../types/leadFields'
import { useParams } from 'react-router-dom'
import { LeadFieldForm } from './LeadFieldForm'
import { getLeadField } from './leadFieldServices'

export const CreateLeadField = () => {
    const { campaignId } = useParams()

    if(campaignId && !isNaN(Number(campaignId))) return (<LeadFieldForm campaignId={Number(campaignId)} />)
}

export const ModifyLeadField = () => {

    const { leadFieldId } = useParams()

    const [leadField, setLeadField] = useState<LeadFieldDetailed | null>(null)

    useEffect(() => {
        if (!leadFieldId) return
        getLeadField(Number(leadFieldId)).then((field)=>{
            console.log(field)
            const newField = {...field}
            newField.validation_rules = field.validation_rules.map(val=>{
                if (val.template_code) return {...val, creation_method: "template"}
                else  return {...val, creation_method: "manual"}
            })
            setLeadField(newField)
        })
    }, [leadFieldId])

    if (leadField) return <LeadFieldForm leadField={leadField} campaignId={leadField.campaign_id}/>

}
