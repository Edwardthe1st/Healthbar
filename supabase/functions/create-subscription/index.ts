import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRICE_IDS: Record<string, string> = {
  no_ads: 'price_1TlnErDEnwt5vv6biugcm0FD',
  plus: 'price_1TlnFvDEnwt5vv6bmJZ9hcYm',
};

// Price ID → amount in cents
const PRICE_AMOUNTS: Record<string, number> = {
  'price_1TlnErDEnwt5vv6biugcm0FD': 299,
  'price_1TlnFvDEnwt5vv6bmJZ9hcYm': 499,
};

async function stripeFetch(path: string, stripeKey: string, method = 'GET', body?: URLSearchParams) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2023-10-16',
    },
    body: body?.toString(),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`Stripe error on ${method} ${path}:`, JSON.stringify(data));
    throw new Error(data.error?.message ?? 'Stripe API error');
  }
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'Missing Stripe key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1. Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Parse body
    const { priceId } = await req.json();
    if (!priceId || !Object.values(PRICE_IDS).includes(priceId)) {
      return new Response(JSON.stringify({ error: 'Invalid priceId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Find or create Stripe Customer
    let stripeCustomerId: string;

    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      stripeCustomerId = existingCustomer.stripe_customer_id;
    } else {
      const body = new URLSearchParams();
      body.append('email', user.email ?? '');
      body.append('metadata[supabase_user_id]', user.id);
      const customer = await stripeFetch('/customers', stripeKey, 'POST', body);
      stripeCustomerId = customer.id;

      await supabaseAdmin.from('customers').upsert({
        id: user.id,
        stripe_customer_id: stripeCustomerId,
      });
    }

    // 4. Cancel existing active/incomplete subscriptions
    const activeSubs = await stripeFetch(
      `/subscriptions?customer=${stripeCustomerId}&status=active`, stripeKey
    );
    for (const sub of activeSubs.data) {
      await stripeFetch(`/subscriptions/${sub.id}`, stripeKey, 'DELETE');
    }

    const incompleteSubs = await stripeFetch(
      `/subscriptions?customer=${stripeCustomerId}&status=incomplete`, stripeKey
    );
    for (const sub of incompleteSubs.data) {
      await stripeFetch(`/subscriptions/${sub.id}`, stripeKey, 'DELETE');
    }

    // 5. Create ephemeral key
    const ekRes = await fetch('https://api.stripe.com/v1/ephemeral_keys', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2023-10-16',
      },
      body: new URLSearchParams({ customer: stripeCustomerId }).toString(),
    });
    const ephemeralKey = await ekRes.json();

    // 6. Create a PaymentIntent directly (instead of relying on subscription invoice)
    const amount = PRICE_AMOUNTS[priceId];
    const piBody = new URLSearchParams();
    piBody.append('amount', String(amount));
    piBody.append('currency', 'eur');
    piBody.append('customer', stripeCustomerId);
    piBody.append('setup_future_usage', 'off_session');
    piBody.append('automatic_payment_methods[enabled]', 'true');
    piBody.append('metadata[price_id]', priceId);
    piBody.append('metadata[supabase_user_id]', user.id);

    const paymentIntent = await stripeFetch('/payment_intents', stripeKey, 'POST', piBody);

    console.log('paymentIntent.id:', paymentIntent.id);
    console.log('paymentIntent.client_secret:', paymentIntent.client_secret ? 'present' : 'missing');

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customerId: stripeCustomerId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('create-subscription error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
