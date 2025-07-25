import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = 'https://ksprlnhxkmzugqayctkw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcHJsbmh4a216dWdxYXljdGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxODgxMzEsImV4cCI6MjA2Nzc2NDEzMX0.C82a1JkHiNAGIBPM_8NBZFSO9oswykSVva-v1fUOex0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('divisions').select('*').limit(1);
    
    if (error) {
      console.error('Database error:', error);
      console.log('Tables may not exist. You need to create them first.');
    } else {
      console.log('Database connection successful!');
      console.log('Sample data:', data);
    }
    
    // Test other tables
    const tables = ['users', 'strategic_objectives', 'strategic_initiatives', 'kpi_definitions'];
    
    for (const table of tables) {
      console.log(`Testing ${table} table...`);
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.error(`Error with ${table}:`, error.message);
      } else {
        console.log(`${table} table exists and accessible`);
      }
    }
    
  } catch (error) {
    console.error('Error testing database:', error);
  }
}

testDatabase();