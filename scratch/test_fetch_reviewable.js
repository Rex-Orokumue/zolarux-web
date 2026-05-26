const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
});

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const userClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const targetEmail = 'gorokumue@gmail.com';
const tempPassword = 'TempPassword123!';

async function run() {
  console.log(`Setting temp password for user ${targetEmail}...`);
  const { data: { users } } = await adminClient.auth.admin.listUsers();
  const targetUser = users.find(u => u.email === targetEmail);
  if (!targetUser) {
    console.error("User not found!");
    return;
  }
  
  await adminClient.auth.admin.updateUserById(targetUser.id, { password: tempPassword });

  console.log("Signing in as user with anon client...");
  const { error: signInError } = await userClient.auth.signInWithPassword({
    email: targetEmail,
    password: tempPassword
  });
  if (signInError) {
    console.error("Failed to sign in:", signInError);
    return;
  }
  console.log("Signed in successfully!");

  console.log("Running orders SELECT query...");
  const { data: orders, error: ordersErr } = await userClient
    .from('orders')
    .select('id, vendor_id, amount, created_at, product_name, product_id, buyer_id, status')
    .eq('buyer_id', targetUser.id)
    .eq('status', 'completed');

  console.log("Orders query result under RLS:", orders, ordersErr);

  console.log("Running reviews SELECT query...");
  const { data: reviews, error: reviewsErr } = await userClient
    .from('reviews')
    .select('order_id')
    .eq('buyer_id', targetUser.id);
  console.log("Reviews query result under RLS:", reviews, reviewsErr);
}

run();
