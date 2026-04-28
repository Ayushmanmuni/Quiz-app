import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://wutgizsncjhxehuhbyjb.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dGdpenNuY2poeGVodWhieWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTMyNjMsImV4cCI6MjA5MjYyOTI2M30.WTtchlKv5fgqI-ZlAUqwPy9T5cpDS7o1t-yh4Tf4U44"

export const supabase = createClient(supabaseUrl, supabaseKey)
