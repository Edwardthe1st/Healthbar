import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PRICE_TO_TIER: Record<string, string> = {
  'price_1TlnErDEnwt5vv6biugcm0FD': 'no_ads',
  'price_1TlnFvDEnwt5vv6bmJZ9hcYm': 'plus',
};

function getTierFromPriceId(priceId: string): string {
  return PRICE_TO_TIER[priceId] ?? 'free';
}

// Verify Stripe webhook signature manually using Web Crypto API
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [key, val] = part.split('=');
    acc[key.trim()] = val;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts['t'];
  const signature = parts['v1'];
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSig === signature;
}

Deno.serve(async (req) => {
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return new Response('Server configuration error', { status: 500 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const isValid = await verifyStripeSignature(body, signature, webhookSecret);
  if (!isValid) {
    console.error('Webhook signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(body);

  async function getUserIdFromCustomerId(customerId: string): Promise<string | null> {
    const { data } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();
    return data?.id ?? null;
  }

  async function updateUserSubscription(userId: string, tier: string) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { subscription: tier },
    });
    if (error) {
      console.error(`Failed to update user ${userId} subscription to ${tier}:`, error);
    }
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const userId = await getUserIdFromCustomerId(customerId);

        if (!userId) {
          console.error(`No user found for Stripe customer ${customerId}`);
          break;
        }

        if (subscription.status === 'active' || subscription.status === 'trialing') {
          const priceId = subscription.items?.data?.[0]?.price?.id;
          if (priceId) {
            const tier = getTierFromPriceId(priceId);
            await updateUserSubscription(userId, tier);
          }
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          await updateUserSubscription(userId, 'free');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const userId = await getUserIdFromCustomerId(customerId);

        if (userId) {
          await updateUserSubscription(userId, 'free');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const userId = await getUserIdFromCustomerId(customerId);

        if (userId) {
          console.warn(`Payment failed for user ${userId}, invoice ${invoice.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Error processing webhook event:', err);
    return new Response('Webhook handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
