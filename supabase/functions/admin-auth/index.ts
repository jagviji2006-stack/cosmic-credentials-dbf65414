import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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
      // Fetch admin credentials from database
      const { data: adminData, error: fetchError } = await supabase
        .from('admin_credentials')
        .select('id, username, password_hash')
        .eq('username', username)
        .single();

      if (fetchError || !adminData) {
        console.log('Admin not found:', fetchError?.message);
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify password
      const isValid = await bcrypt.compare(password, adminData.password_hash);
      
      if (!isValid) {
        console.log('Invalid password for user:', username);
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate a simple session token (in production, use JWT with expiry)
      const sessionToken = crypto.randomUUID() + '-' + Date.now();
      const tokenHash = await bcrypt.hash(sessionToken, await bcrypt.genSalt(8));

      // Store session in admin_credentials (we'll update the table to support this)
      const { error: updateError } = await supabase
        .from('admin_credentials')
        .update({ session_token: tokenHash, session_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
        .eq('id', adminData.id);

      if (updateError) {
        console.error('Failed to store session:', updateError);
      }

      console.log('Admin login successful:', username);
      return new Response(
        JSON.stringify({ 
          success: true, 
          token: sessionToken,
          adminId: adminData.id 
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
