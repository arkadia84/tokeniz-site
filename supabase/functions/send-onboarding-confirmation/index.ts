import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { OnboardingConfirmationEmail } from '../_shared/email-templates/onboarding-confirmation.tsx'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SITE_NAME = 'Tokeniz'
const FROM_EMAIL = 'Tokeniz <noreply@tokeniz.ai>'
const ROOT_DOMAIN = 'tokeniz.ai'
const CC_RECIPIENTS = ['hello@propex.app']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Authenticate caller
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get request body early to check for targetUserId
    const body = await req.json()
    const { companyName, plan, walletAddress, targetUserId } = body

    let userId: string

    // If service_role key is used and targetUserId provided, allow admin send
    const token = authHeader.replace('Bearer ', '')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (token === serviceRoleKey && targetUserId) {
      userId = targetUserId
      console.log('Admin-triggered send for user', userId)
    } else {
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      userId = claimsData.claims.sub
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // body already parsed above

    // Fetch user profile
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('first_name, last_name, email, user_role')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Failed to fetch profile', profileError)
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const roleLabels: Record<string, string> = {
      founder: 'Founder',
      director: 'Director',
      manager: 'Manager',
    }

    const planLabels: Record<string, string> = {
      essential: 'Essential',
      explorer: 'Explorer',
      elite: 'Elite',
    }

    const recipientEmail = profile.email || claimsData.claims.email || ''

    const templateProps = {
      firstName: profile.first_name || 'there',
      lastName: profile.last_name || '',
      email: recipientEmail,
      userRole: roleLabels[profile.user_role || ''] || profile.user_role || 'Member',
      companyName: companyName || 'Your Company',
      companyStructure: `${companyName}, a Series of Tokenizio LLC`,
      plan: planLabels[plan] || plan || 'Essential',
      walletAddress: walletAddress || '',
      dashboardUrl: `https://${ROOT_DOMAIN}/dashboard`,
    }

    const html = await renderAsync(React.createElement(OnboardingConfirmationEmail, templateProps))

    // Send via Resend API
    const resendPayload = {
      from: FROM_EMAIL,
      to: [recipientEmail],
      cc: CC_RECIPIENTS,
      subject: `${companyName} is ready — your setup summary`,
      html,
    }

    console.log('Sending onboarding email via Resend', { to: recipientEmail, cc: CC_RECIPIENTS })

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    })

    const resendResult = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API error', { status: resendResponse.status, result: resendResult })
      await serviceClient.from('email_send_log').insert({
        message_id: resendResult.id || crypto.randomUUID(),
        template_name: 'onboarding_confirmation',
        recipient_email: recipientEmail,
        status: 'failed',
        error_message: `Resend error: ${JSON.stringify(resendResult)}`,
      })
      return new Response(JSON.stringify({ error: 'Failed to send email', details: resendResult }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log success
    await serviceClient.from('email_send_log').insert({
      message_id: resendResult.id || crypto.randomUUID(),
      template_name: 'onboarding_confirmation',
      recipient_email: recipientEmail,
      status: 'sent',
    })

    console.log('Onboarding confirmation email sent', { id: resendResult.id, to: recipientEmail })

    return new Response(JSON.stringify({ success: true, emailId: resendResult.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error sending onboarding confirmation:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
