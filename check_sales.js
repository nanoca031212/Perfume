
const Stripe = require('stripe');
const dotenv = require('dotenv');
const fs = require('fs');

// Carrega variáveis de ambiente
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkSales() {
  console.log('--- RELATÓRIO DE VENDAS STRIPE ---\n');
  
  try {
    // Busca Checkout Sessions recentes (últimas 100)
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.customer'],
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
    const startOfYesterday = startOfToday - 86400;
    const startOf7DaysAgo = startOfToday - (7 * 86400);

    let stats = {
      today: { count: 0, total: 0 },
      yesterday: { count: 0, total: 0 },
      last7Days: { count: 0, total: 0 },
      all: { count: 0, total: 0 }
    };

    const recentTransactions = [];

    sessions.data.forEach(session => {
      if (session.payment_status !== 'paid') return;

      const amount = session.amount_total / 100;
      const created = session.created;
      const currency = session.currency.toUpperCase();

      // Stats
      if (created >= startOfToday) {
        stats.today.count++;
        stats.today.total += amount;
      } else if (created >= startOfYesterday && created < startOfToday) {
        stats.yesterday.count++;
        stats.yesterday.total += amount;
      }

      if (created >= startOf7DaysAgo) {
        stats.last7Days.count++;
        stats.last7Days.total += amount;
      }

      stats.all.count++;
      stats.all.total += amount;

      // Email fallback
      let email = session.customer_details?.email || 
                  session.customer_email ||
                  (session.customer && typeof session.customer === 'object' ? session.customer.email : session.customer) ||
                  session.metadata?.email || 
                  session.metadata?.customer_email || 
                  'N/A';

      // Check if email is just an ID
      if (typeof email === 'string' && email.startsWith('cus_')) email = 'N/A';

      // UTMify / UTMs
      const utm = session.metadata?.utm_source || 
                  session.metadata?.utm_campaign ||
                  session.metadata?.src || 
                  session.metadata?.xcod || 
                  session.metadata?.utmify_source || 
                  'N/A';

      const criativo = session.metadata?.utm_content || 
                       session.metadata?.utm_term || 
                       'N/A';

      // Add to recent if within last 10
      if (recentTransactions.length < 10) {
        recentTransactions.push({
          id: session.id,
          email: email,
          amount: amount,
          currency: currency,
          date: new Date(created * 1000).toLocaleString('pt-BR'),
          utm: utm,
          criativo: criativo,
        });
      }
    });

    // Output Summary
    console.log(`HOJE: ${stats.today.count} vendas | Total: ${stats.today.total.toFixed(2)} GBP (aprox)`);
    console.log(`ONTEM: ${stats.yesterday.count} vendas | Total: ${stats.yesterday.total.toFixed(2)} GBP (aprox)`);
    console.log(`ÚLTIMOS 7 DIAS: ${stats.last7Days.count} vendas | Total: ${stats.last7Days.total.toFixed(2)} GBP (aprox)`);
    console.log(`----------------------------------\n`);

    console.log('ÚLTIMAS 10 TRANSAÇÕES:');
    recentTransactions.forEach((t, i) => {
      console.log(`${(i + 1).toString().padEnd(2)} [${t.date}] ${t.amount.toFixed(2).padStart(8)} ${t.currency} - ${t.email.padEnd(30)}`);
      console.log(`      (UTM: ${t.utm} | Criativo: ${t.criativo})`);
    });

  } catch (error) {
    console.error('Erro ao buscar vendas:', error.message);
  }
}

checkSales();
