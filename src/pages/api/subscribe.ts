import type { APIRoute } from 'astro'
import MailerLite from '@mailerlite/mailerlite-nodejs'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { email } = await request.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
      })
    }

    // @ts-ignore
    const API_KEY = locals.runtime.env.MAILERLITE_API_KEY
    // @ts-ignore
    const GROUP_ID = locals.runtime.env.MAILERLITE_GROUP_ID

    if (!API_KEY || !GROUP_ID) {
      console.error('Missing MailerLite configuration')
      return new Response(JSON.stringify({ error: 'Something went wrong' }), {
        status: 500,
      })
    }

    const mailerlite = new MailerLite({ api_key: API_KEY })

    try {
      // 1. Create or update the subscriber
      await mailerlite.subscribers.createOrUpdate({
        email,
        groups: [GROUP_ID],
      })
    } catch (err: any) {
      let errorMessage = 'Failed to subscribe'
      if (err?.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message
      } else if (err?.message) {
        errorMessage = err.message
      }
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
      })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    console.error('Newsletter subscription error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    })
  }
}
