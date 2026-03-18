import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface ProcessingStatus {
  stripe_data: 'loading' | 'success' | 'error';
  utm_tracking: 'loading' | 'success' | 'error';
}

export default function CheckoutSuccess() {
  const router = useRouter()
  const { clearCart } = useCart()
  const { session_id, payment_intent } = router.query
  const [processing, setProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    stripe_data: 'loading',
    utm_tracking: 'loading'
  })
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Limpar o carrinho e processar pedido quando session_id ou payment_intent estiver disponível
    if (session_id && typeof session_id === 'string') {
      clearCart()
      processOrder(session_id, 'session')
    } else if (payment_intent && typeof payment_intent === 'string') {
      clearCart()
      processOrder(payment_intent, 'payment_intent')
    }
  }, [session_id, payment_intent, clearCart])

  const processOrder = async (id: string, type: 'session' | 'payment_intent') => {
    setProcessing(true)
    setError(null)

    try {
      // 1. Buscar dados da sessão/intent do Stripe
      console.log(`🔍 Buscando dados do Stripe (${type}):`, id)
      setProcessingStatus(prev => ({ ...prev, stripe_data: 'loading' }))
      
      const endpoint = type === 'session' 
        ? `/api/stripe/session-details?session_id=${id}`
        : `/api/stripe/payment-intent-details?payment_intent_id=${id}`

      const stripeResponse = await fetch(endpoint)
      
      if (!stripeResponse.ok) {
        throw new Error(`Falha ao buscar dados (${type}) do Stripe`)
      }
      
      const stripeData = await stripeResponse.json()
      setOrderDetails(stripeData.data)
      setProcessingStatus(prev => ({ ...prev, stripe_data: 'success' }))
      
      console.log('✅ Dados do Stripe recuperados:', stripeData.data)

      // 3. Processar tracking UTM (se disponível)
      setProcessingStatus(prev => ({ ...prev, utm_tracking: 'loading' }))
      
      const utms = stripeData.data.utm_params || {};
      if (Object.values(utms).some(v => v)) {
        console.log('📊 Processando tracking UTM:', utms)
        setProcessingStatus(prev => ({ ...prev, utm_tracking: 'success' }))
      } else {
        console.log('ℹ️ Nenhum UTM encontrado')
        setProcessingStatus(prev => ({ ...prev, utm_tracking: 'success' }))
      }

    } catch (error: any) {
      console.error('❌ Erro ao processar pedido:', error)
      setError(error.message)
      setProcessingStatus({
        stripe_data: 'error',
        utm_tracking: 'error'
      })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusIcon = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusText = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return 'Processando...'
      case 'success':
        return 'Concluído'
      case 'error':
        return 'Erro'
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        
        <h1 className="text-2xl font-bold mb-2">Payment Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been processed successfully. You will receive an email with the details of your purchase.
        </p>
        
        {session_id && (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-sm text-gray-500">ID da transação:</p>
            <p className="text-xs font-mono break-all">{session_id}</p>
          </div>
        )}

        {/* Status do processamento */}
        {processing || Object.values(processingStatus).some(status => status === 'loading') ? (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-3">Processando seu pedido...</h3>
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Dados do Stripe</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(processingStatus.stripe_data)}
                  <span className="text-xs text-blue-600">{getStatusText(processingStatus.stripe_data)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Tracking UTM</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(processingStatus.utm_tracking)}
                  <span className="text-xs text-blue-600">{getStatusText(processingStatus.utm_tracking)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Detalhes do pedido */}
        {orderDetails && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-6 text-left">
            <h3 className="text-sm font-medium text-green-800 mb-3">Detalhes do Pedido</h3>
            <div className="space-y-1 text-xs text-green-700">
              <div>Email: {orderDetails.customer.email}</div>
              <div>Total: {orderDetails.currency.toUpperCase()} {(orderDetails.amount_total / 100).toFixed(2)}</div>
              <div>Itens: {orderDetails.line_items.length}</div>
              {orderDetails.utm_params.utm_source && (
                <div>UTM Source: {orderDetails.utm_params.utm_source}</div>
              )}
              {orderDetails.utm_params.utm_medium && (
                <div>UTM Medium: {orderDetails.utm_params.utm_medium}</div>
              )}
              {orderDetails.utm_params.utm_campaign && (
                <div>UTM Campaign: {orderDetails.utm_params.utm_campaign}</div>
              )}
              {orderDetails.utm_params.src && (
                <div>SRC: {orderDetails.utm_params.src}</div>
              )}
              {orderDetails.utm_params.sck && (
                <div>SCK: {orderDetails.utm_params.sck}</div>
              )}
              {orderDetails.utm_params.xcod && (
                <div>XCOD: {orderDetails.utm_params.xcod}</div>
              )}
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
            <h3 className="text-sm font-medium text-red-800 mb-2">Erro no processamento</h3>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <Link href="/" className="block w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-900">
            Voltar para a loja
          </Link>
          
          <Link href="/collections/mens" className="block w-full bg-white text-black border border-black py-3 rounded-full font-medium hover:bg-gray-50">
            Ver mais perfumes
          </Link>
        </div>
      </div>
    </div>
  )
}