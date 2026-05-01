'use server'

import { gc } from '@/lib/supabase'
import { WildlifeSurveySchema, type WildlifeSurvey } from '@/lib/schemas/survey'
import { revalidatePath } from 'next/cache'

export async function submitSurvey(data: WildlifeSurvey) {
    // Validate on server side
    const validated = WildlifeSurveySchema.safeParse(data)
    
    if (!validated.success) {
        return { success: false, error: validated.error.flatten() }
    }

    const { observations, ...surveyData } = validated.data

    try {
        // Insert main survey record
        const { data: survey, error: sError } = await gc
            .from('surveys')
            .insert([surveyData])
            .select()
            .single()

        if (sError) throw sError

        // Insert observations linked to survey
        const obsToInsert = observations.map(obs => ({
            ...obs,
            survey_id: survey.id
        }))

        const { error: oError } = await gc
            .from('observations')
            .insert(obsToInsert)

        if (oError) throw oError

        revalidatePath(`/dashboard/${data.park_id}`)
        return { success: true, id: survey.id }
        
    } catch (error: any) {
        console.error('Survey submission error:', error)
        return { success: false, error: error.message }
    }
}
