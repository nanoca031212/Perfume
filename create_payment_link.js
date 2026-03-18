
const Stripe = require('stripe');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test')) {
  dotenv.config(); // Fallback para .env se .env.local não for de teste
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function findPriceAndCreateLink() {
  try {
    const productId = 'prod_UAKeoXZR8FR5Qg';
    console.log(`Searching for prices for product: ${productId}`);
    
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 1,
    });

    if (prices.data.length === 0) {
      console.error(`ERROR: No active prices found for product ${productId}`);
      return;
    }

    const priceId = prices.data[0].id;
    console.log(`Found Price ID: ${priceId}`);

    // Cria o Payment Link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        },
      },
      // Habilita as UTMs no Payment Link
      metadata: {
        created_for: 'teste_utm_link',
      },
      // Observação: Payment Links coletam UTMs automaticamente da URL
    });

    console.log('RESULT_LINK:' + paymentLink.url);
  } catch (error) {
    console.error('ERROR:' + error.message);
  }
}

findPriceAndCreateLink();
