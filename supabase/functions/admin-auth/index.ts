import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password, action } = await req.json();
    
    console.log(`Admin auth request: action=${action}, username=${username}`);

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'login') {
      // Verify credentials using database function (uses pgcrypto)
      const { data: authResult, error: authError } = await supabase
        .rpc('verify_admin_password', { 
          p_username: username, 
          p_password: password 
        });

      if (authError) {
        console.error('Auth verification error:', authError);
        return new Response(
          JSON.stringify({ error: 'Authentication failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!authResult || authResult.length === 0 || !authResult[0].is_valid) {
        console.log('Invalid credentials for user:', username);
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const adminId = authResult[0].admin_id;

      // Generate a session token
      const sessionToken = crypto.randomUUID() + '-' + Date.now();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Store session using database function
      const { error: sessionError } = await supabase
        .rpc('update_admin_session', {
          p_admin_id: adminId,
          p_session_token: sessionToken,
          p_expires_at: expiresAt
        });

      if (sessionError) {
        console.error('Failed to store session:', sessionError);
      }

      console.log('Admin login successful:', username);
      return new Response(
        JSON.stringify({ 
          success: true, 
          token: sessionToken,
          adminId: adminId 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
