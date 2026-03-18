import Head from 'next/head';
import HeaderTPS from '@/components/layout/HeaderTPS';
import FooterTPS from '@/components/layout/FooterTPS';
import { useState } from 'react';
import { useUTM } from '@/hooks/useUTM';

export default function TestePage() {
  const [loading, setLoading] = useState(false);
  const { utmParams, isLoaded } = useUTM();

  const handleRedirect = async () => {
    console.log('🚀 Iniciando redirecionamento com UTMs via API (para Metadata):', utmParams);
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout-redirect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ utmParams }),
      });
      const data = await response.json();
      
      if (data.url) {
        // Redireciona para a página de checkout hospedada pelo Stripe (com metadados injetados)
        window.location.href = data.url;
      } else {
        alert('Erro ao redirecionar: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão ao tentar redirecionar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Head>
        <title>Teste de Checkout | Perfumes UK</title>
        <meta name="description" content="Página de teste para redirecionamento ao checkout do Stripe" />
      </Head>
      
      <HeaderTPS sticky={true} />

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-10 text-center border border-gray-50">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Checkout Direto
          </h1>
          
          <p className="text-gray-500 mb-10 leading-relaxed">
            Você será redirecionado para a página oficial de pagamento do Stripe para concluir sua compra com total segurança.
          </p>
          
          <button
            onClick={handleRedirect}
            disabled={loading || !isLoaded}
            className={`
              group relative w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform
              ${(loading || !isLoaded) 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-900 hover:shadow-2xl hover:-translate-y-1 active:scale-95'}
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Preparando Checkout...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Ir para o Checkout
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            )}
          </button>
          
          <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center gap-4 grayscale opacity-50">
             {/* Simulação de logos de pagamento para estética premium */}
             <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Secure Payments via Stripe</div>
          </div>
        </div>
      </main>

      <FooterTPS />
    </div>
  );
}
