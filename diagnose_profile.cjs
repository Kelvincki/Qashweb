const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL || 'https://afstcyjnzwaurkqmomnj.supabase.co';
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(url, key);

async function diagnose() {
  console.log("==================================================");
  console.log("SUPABASE PROFILE DIAGNOSTIC");
  console.log("==================================================");
  console.log("Target Supabase URL:", url);
  console.log("Publishable Key present:", !!key, key ? key.substring(0, 15) + "..." : "NONE");

  // 1. Inspect profiles table
  console.log("\n--- 1. Querying public.profiles with anon key ---");
  const { data: profiles, error: profileErr, status: profileStatus } = await supabase
    .from('profiles')
    .select('id, role, store_id');

  console.log("HTTP Status:", profileStatus);
  console.log("Error:", profileErr);
  console.log("Data count in profiles:", profiles ? profiles.length : 0);
  console.log("Profiles data:", profiles);

  // 2. Test querying with maybeSingle for a dummy UUID vs real UUIDs
  if (profiles && profiles.length > 0) {
    const existingId = profiles[0].id;
    console.log(`\n--- 2. Testing query for existing profile ID: ${existingId} ---`);
    const { data: singleData, error: singleErr, status: singleStatus } = await supabase
      .from('profiles')
      .select('id, role, store_id')
      .eq('id', existingId)
      .maybeSingle();

    console.log("HTTP Status:", singleStatus);
    console.log("Error:", singleErr);
    console.log("Single Data:", singleData);
  }

  // 3. Test querying for non-existent user ID
  const fakeId = '00000000-0000-0000-0000-000000000000';
  console.log(`\n--- 3. Testing query for non-existent profile ID: ${fakeId} ---`);
  const { data: fakeData, error: fakeErr, status: fakeStatus } = await supabase
    .from('profiles')
    .select('id, role, store_id')
    .eq('id', fakeId)
    .maybeSingle();

  console.log("HTTP Status:", fakeStatus);
  console.log("Error:", fakeErr);
  console.log("Fake Data:", fakeData);

  // 4. Test querying with .single() instead of .maybeSingle() for non-existent user ID
  console.log(`\n--- 4. Testing .single() for non-existent profile ID: ${fakeId} ---`);
  const { data: singleFakeData, error: singleFakeErr, status: singleFakeStatus } = await supabase
    .from('profiles')
    .select('id, role, store_id')
    .eq('id', fakeId)
    .single();

  console.log("HTTP Status:", singleFakeStatus);
  console.log("Error:", singleFakeErr);
  console.log("Single Fake Data:", singleFakeData);
}

diagnose();
