import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://mvywknmklwlnkoxkqzqy.supabase.co';
const supabaseKey = 'sb_publishable_JMr8QsUTfhoK1g2pBRXgIA_FVn5XEOA';


export const supabase = createClient(supabaseUrl, supabaseKey);