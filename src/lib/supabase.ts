import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

// Use server-only environment variables here. Do NOT use NEXT_PUBLIC_* envs.
export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        // Use a server-side key (service role or server key). This must NOT be exposed to clients.
        const key = process.env.SUPABASE_SERVICE_KEY || 
                    process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.SUPABASE_ANON_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) {
            throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY (server-only)");
        }
        _supabase = createClient(url, key);
    }
    return _supabase;
}
