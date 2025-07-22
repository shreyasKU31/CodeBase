// Test script to verify database and API connections
require('dotenv').config();
const supabase = require('./server/config/supabase');

async function testConnections() {
  console.log('🔍 Testing DevHance connections...\n');

  // Test 1: Database Connection
  console.log('1. Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log('❌ Database connection failed:', error.message);
    } else {
      console.log('✅ Database connection successful');
    }
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
  }

  // Test 2: Environment Variables
  console.log('\n2. Checking environment variables...');
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'CLERK_JWT_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
  } else {
    console.log('✅ All required environment variables are set');
  }

  // Test 3: Database Tables
  console.log('\n3. Checking database tables...');
  const tables = ['users', 'projects', 'project_likes', 'project_comments'];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ Table '${table}' not found or inaccessible`);
      } else {
        console.log(`✅ Table '${table}' is accessible`);
      }
    } catch (error) {
      console.log(`❌ Error accessing table '${table}':`, error.message);
    }
  }

  console.log('\n🎉 Connection test completed!');
  console.log('\nNext steps:');
  console.log('1. Make sure your client .env has VITE_CLERK_PUBLISHABLE_KEY');
  console.log('2. Run the database schema in Supabase SQL editor');
  console.log('3. Start the server: cd server && npm start');
  console.log('4. Start the client: cd client && npm run dev');
}

testConnections().catch(console.error); 