import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Get current user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user record from users table
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === 'authorize') {
      // Generate OAuth URL
      const redirectUri = `${supabaseUrl}/functions/v1/google-calendar-auth/callback`;
      const scope = 'https://www.googleapis.com/auth/calendar';
      const state = userData.id; // Pass user ID as state
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${state}`;

      return new Response(JSON.stringify({ authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === 'callback') {
      // Handle OAuth callback
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!code || !state) {
        return new Response('Missing code or state parameter', { status: 400 });
      }

      // Exchange code for tokens
      const redirectUri = `${supabaseUrl}/functions/v1/google-calendar-auth/callback`;
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenResponse.json();

      if (!tokens.access_token) {
        console.error('Token exchange failed:', tokens);
        return new Response('Token exchange failed', { status: 400 });
      }

      // Calculate expiry time
      const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000));

      // Store tokens in database
      const { error: insertError } = await supabase
        .from('google_calendar_tokens')
        .upsert({
          user_id: state,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error('Failed to store tokens:', insertError);
        return new Response('Failed to store tokens', { status: 500 });
      }

      // Redirect to agenda page with success message
      return new Response(
        `<html><body><script>window.close(); window.opener.postMessage({type: 'google_auth_success'}, '*');</script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (path === 'disconnect') {
      // Disconnect Google Calendar
      const { error } = await supabase
        .from('google_calendar_tokens')
        .delete()
        .eq('user_id', userData.id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === 'status') {
      // Check connection status
      const { data: tokenData, error: tokenError } = await supabase
        .from('google_calendar_tokens')
        .select('expires_at')
        .eq('user_id', userData.id)
        .single();

      // Handle case when no tokens are found (PGRST116 error)
      if (tokenError && tokenError.code === 'PGRST116') {
        return new Response(JSON.stringify({ isConnected: false }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Handle other potential errors
      if (tokenError) {
        console.error('Error fetching Google Calendar tokens:', tokenError);
        return new Response(JSON.stringify({ isConnected: false }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const isConnected = tokenData && new Date(tokenData.expires_at) > new Date();

      return new Response(JSON.stringify({ isConnected: !!isConnected }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  } catch (error) {
    console.error('Error in google-calendar-auth:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});