// CommonJS + lazy init for Electron main process
let _supabase = null;

function getSupabase() {
	if (_supabase) return _supabase;
	const supabaseUrl = process.env.SUPABASE_URL;
	const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
	if (!supabaseUrl || !supabaseKey) {
		throw new Error('Missing SUPABASE_URL or SUPABASE_*_KEY environment variables');
	}
	const { createClient } = require('@supabase/supabase-js');
	_supabase = createClient(supabaseUrl, supabaseKey);
	return _supabase;
}

module.exports = { getSupabase };