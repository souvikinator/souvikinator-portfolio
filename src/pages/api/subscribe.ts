import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }), 
        { status: 400 }
      );
    }

    // Replace with your actual API key and group ID from environment variables
    const API_KEY = import.meta.env.MAILERLITE_API_KEY;
    const GROUP_ID = import.meta.env.MAILERLITE_GROUP_ID;

    if (!API_KEY || !GROUP_ID) {
      return new Response(
        JSON.stringify({ error: 'Missing API configuration' }), 
        { status: 500 }
      );
    }

    const res = await fetch('https://api.mailerlite.com/api/v2/groups/' + GROUP_ID + '/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MailerLite-ApiKey': API_KEY,
      },
      body: JSON.stringify({
        email,
        resubscribe: true
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ 
          error: data.error?.message || 'Subscription failed' 
        }), 
        { status: res.status }
      );
    }

    return new Response(
      JSON.stringify({ success: true }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('Newsletter subscription error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
}