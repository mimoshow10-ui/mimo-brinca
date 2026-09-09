import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://axcnksofmgciatrmivpn.supabase.co'
const supabaseAnonKey = 'sb_publishable_aFMv5BcsLKpcDGav1dMSmQ_y9DyO0fV'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
