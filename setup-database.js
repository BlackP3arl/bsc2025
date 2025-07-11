import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ksprlnhxkmzugqayctkw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcHJsbmh4a216dWdxYXljdGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxODgxMzEsImV4cCI6MjA2Nzc2NDEzMX0.C82a1JkHiNAGIBPM_8NBZFSO9oswykSVva-v1fUOex0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Read the schema file
    const schema = readFileSync('./database/schema.sql', 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`Error executing statement ${i + 1}:`, err);
      }
    }
    
    console.log('Database setup completed!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();