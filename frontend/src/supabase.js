import { createClient } from '@supabase/supabase-js'

// Estas son las credenciales locales de tu Supabase
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

export const supabase = createClient(supabaseUrl, supabaseKey)