
const Stripe = require('stripe');
const fs = require('fs');
const dotenv = require('dotenv');

// Tenta carregar .env.local primeiro para pegar chaves de teste se existirem
dotenv.config({ path: '.env.local' });
if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test')) {
  dotenv.config();
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function generateAllLinks() {
  try {
    const variantMapping = JSON.parse(fs.readFileSync('./data/stripe_variant_mapping.json', 'utf8'));
    const paymentLinks = {};
    const handles = Object.keys(variantMapping);

    console.log(`🚀 Iniciando geração de links para ${handles.length} produtos...`);

    for (const handle of handles) {
      const priceId = variantMapping[handle];
      console.log(`📦 Criando link para: ${handle} (${priceId})`);

      try {
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
          metadata: {
            product_handle: handle,
          },
        });
        paymentLinks[handle] = paymentLink.url;
        console.log(`✅ Sucesso: ${paymentLink.url}`);
      } catch (err) {
        console.error(`❌ Erro em ${handle}: ${err.message}`);
      }
      
      // Pequeno delay para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    fs.writeFileSync('./data/stripe_payment_links.json', JSON.stringify(paymentLinks, null, 2));
    console.log('\n🎉 Todos os links foram gerados e salvos em ./data/stripe_payment_links.json');
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

generateAllLinks();
