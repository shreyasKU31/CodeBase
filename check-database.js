// Script to check database for users
const supabase = require('./server/config/supabase');

async function checkDatabase() {
  console.log('=== Checking Database for Users ===');
  
  try {
    // Check if users table exists and has data
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Error querying users table:', error);
      return;
    }
    
    console.log(`✅ Found ${data.length} users in database`);
    
    if (data.length > 0) {
      console.log('\nRecent users:');
      data.forEach((user, index) => {
        console.log(`${index + 1}. ${user.display_name} (${user.username}) - ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Profile Complete: ${user.is_profile_complete}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });
    } else {
      console.log('📝 No users found in database');
      console.log('This is normal if no users have signed up yet');
    }
    
    // Check table structure
    console.log('\n=== Checking Table Structure ===');
    try {
      const { data: structure, error: structureError } = await supabase
        .from('users')
        .select('*')
        .limit(0);
      
      if (structureError) {
        console.error('❌ Error checking table structure:', structureError);
      } else {
        console.log('✅ Users table is accessible');
      }
    } catch (err) {
      console.error('❌ Failed to check table structure:', err.message);
    }
    
  } catch (err) {
    console.error('❌ Failed to check database:', err.message);
  }
}

checkDatabase().catch(console.error); 