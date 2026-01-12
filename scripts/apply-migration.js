#!/usr/bin/env node

/**
 * Database Migration Script
 * This script helps you apply the draw_offered_by migration to your Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function applyMigration() {
  console.log('\n🚀 Supabase Migration Tool\n');
  console.log('This script will apply the draw_offered_by migration to your database.\n');

  // Get environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase credentials not found in environment variables.');
    console.log('\nPlease make sure your .env file contains:');
    console.log('  VITE_SUPABASE_URL=your-project-url');
    console.log('  VITE_SUPABASE_ANON_KEY=your-anon-key\n');
    process.exit(1);
  }

  console.log('✓ Found Supabase credentials');
  console.log(`  URL: ${supabaseUrl}\n`);

  const proceed = await question('Do you want to apply the migration? (yes/no): ');
  
  if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
    console.log('\n❌ Migration cancelled.');
    rl.close();
    process.exit(0);
  }

  console.log('\n📝 Applying migration...\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Note: The anon key typically doesn't have permission to ALTER TABLE
  // This script will guide the user to apply it manually
  
  console.log('⚠️  Note: Direct SQL execution requires elevated permissions.');
  console.log('Please apply this migration manually in your Supabase Dashboard:\n');
  console.log('─'.repeat(60));
  console.log(`
-- Add draw offer and time control fields to chess_games table
ALTER TABLE public.chess_games 
ADD COLUMN IF NOT EXISTS draw_offered_by TEXT,
ADD COLUMN IF NOT EXISTS time_control INTEGER DEFAULT 600,
ADD COLUMN IF NOT EXISTS time_increment INTEGER DEFAULT 0;

-- Update existing games to have default values
UPDATE public.chess_games 
SET time_control = 600, time_increment = 0 
WHERE time_control IS NULL;
  `);
  console.log('─'.repeat(60));
  console.log('\n📋 Steps:');
  console.log('  1. Go to: https://supabase.com/dashboard');
  console.log('  2. Select your project');
  console.log('  3. Click "SQL Editor" in the left sidebar');
  console.log('  4. Click "+ New Query"');
  console.log('  5. Copy and paste the SQL above');
  console.log('  6. Click "Run" (or press Ctrl+Enter)\n');

  const applied = await question('Have you applied the migration? (yes/no): ');
  
  if (applied.toLowerCase() === 'yes' || applied.toLowerCase() === 'y') {
    console.log('\n🔍 Verifying migration...\n');
    
    try {
      // Try to query the table to see if columns exist
      const { data, error } = await supabase
        .from('chess_games')
        .select('draw_offered_by, time_control, time_increment')
        .limit(1);

      if (error) {
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.log('❌ Migration not detected. Please apply the SQL in Supabase Dashboard.');
        } else {
          console.log('⚠️  Could not verify migration:', error.message);
        }
      } else {
        console.log('✅ Migration verified successfully!');
        console.log('   Columns detected: draw_offered_by, time_control, time_increment\n');
        console.log('🎉 You can now use the draw offer feature!\n');
      }
    } catch (err) {
      console.log('⚠️  Verification error:', err.message);
    }
  } else {
    console.log('\n📖 See QUICK_FIX_DRAW_OFFER.md for detailed instructions.\n');
  }

  rl.close();
}

applyMigration().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
