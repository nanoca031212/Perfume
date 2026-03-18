
const Stripe = require('stripe');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function findPaymentLink() {
  try {
    const paymentLinks = await stripe.paymentLinks.list({
      limit: 100,
    });

    const matchingLink = paymentLinks.data.find(link => 
      link.active && (
        link.metadata?.product_id === 'prod_UAKeoXZR8FR5Qg' ||
        link.url.includes('perfume') // Fallback check
      )
    );

    if (matchingLink) {
      console.log('RESULT_LINK:' + matchingLink.url);
    } else {
      console.log('NOT_FOUND_SPECIFIC');
      console.log('ALL_LINKS:' + JSON.stringify(paymentLinks.data.map(l => l.url)));
    }
  } catch (error) {
    console.error('ERROR:' + error.message);
  }
}

findPaymentLink();
