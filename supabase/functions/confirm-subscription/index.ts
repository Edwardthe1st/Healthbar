import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRICE_IDS: Record<string, string> = {
  no_ads: 'price_1TlnErDEnwt5vv6biugcm0FD',
  plus: 'price_1TlnFvDEnwt5vv6bmJZ9hcYm',
};

const PRICE_TO_TIER: Record<string, string> = {
  'price_1TlnErDEnwt5vv6biugcm0FD': 'no_ads',
  'price_1TlnFvDEnwt5vv6bmJZ9hcYm': 'plus',
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

    // 3. Get Stripe customer
    const { data: customerRow } = await supabaseAdmin
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!customerRow?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No customer found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripeCustomerId = customerRow.stripe_customer_id;

    // 4. Get the customer's default payment method
    const customer = await stripeFetch(`/customers/${stripeCustomerId}`, stripeKey);
    const paymentMethodId =
      customer.invoice_settings?.default_payment_method ||
      customer.default_source;

    // If no default, get the latest payment method
    let pmId = paymentMethodId;
    if (!pmId) {
      const pms = await stripeFetch(
        `/payment_methods?customer=${stripeCustomerId}&type=card&limit=1`, stripeKey
      );
      if (pms.data.length > 0) {
        pmId = pms.data[0].id;
        // Set it as default
        const updateBody = new URLSearchParams();
        updateBody.append('invoice_settings[default_payment_method]', pmId);
        await stripeFetch(`/customers/${stripeCustomerId}`, stripeKey, 'POST', updateBody);
      }
    }

    // 5. Create subscription with the saved payment method
    const subBody = new URLSearchParams();
    subBody.append('customer', stripeCustomerId);
    subBody.append('items[0][price]', priceId);
    if (pmId) {
      subBody.append('default_payment_method', pmId);
    }

    const subscription = await stripeFetch('/subscriptions', stripeKey, 'POST', subBody);
    console.log('subscription created:', subscription.id, 'status:', subscription.status);

    // 6. Update user metadata
    const tier = PRICE_TO_TIER[priceId] ?? 'free';
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { subscription: tier },
    });

    return new Response(
      JSON.stringify({ status: 'ok', subscriptionId: subscription.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('confirm-subscription error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
