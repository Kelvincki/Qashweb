import { createClient } from '@supabase/supabase-js';

// Get environment variables with robust fallback values to prevent unhandled startup crashes
const defaultUrl = 'https://afstcyjnzwaurkqmomnj.supabase.co';
const defaultKey = 'placeholder_anon_key_please_configure_in_env_or_settings';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Clean up and validate URL
const supabaseUrl = (rawUrl && rawUrl.startsWith('http')) ? rawUrl.trim() : defaultUrl;
const supabaseAnonKey = (rawKey && rawKey.trim()) ? rawKey.trim() : defaultKey;

if (!rawUrl || !rawKey) {
  console.warn(
    'Supabase URL or Publishable Key is missing or invalid in environment variables. ' +
    'Falling back to default values to prevent startup crashes. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
