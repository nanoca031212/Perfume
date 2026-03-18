
const Stripe = require('stripe');
const dotenv = require('dotenv');
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function listAllLinks() {
  try {
    const paymentLinks = await stripe.paymentLinks.list({ limit: 100 });
    console.log('--- ALL PAYMENT LINKS ---');
    paymentLinks.data.forEach(link => {
      console.log(`URL: ${link.url} | Active: ${link.active} | ID: ${link.id}`);
    });
    console.log('--- END ---');
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

listAllLinks();
