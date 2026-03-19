'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, XCircle, AlertCircle, RotateCcw } from 'lucide-react';

type TxStatus = 'APPROVED' | 'PENDING' | 'DECLINED' | 'VOIDED' | 'ERROR';
type PageState = 'loading' | 'done' | 'error';

interface TxResult {
  status: TxStatus;
  reference: string;
  amount_in_cents?: number;
  payment_method?: string;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');
  const [pageState, setPageState] = useState<PageState>('loading');
  const [result, setResult] = useState<TxResult | null>(null);

  useEffect(() => {
    if (!transactionId) {
      setPageState('error');
      return;
    }

    fetch(`/api/wompi/transaction?id=${encodeURIComponent(transactionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setPageState('error');
        } else {
          setResult(data);
          setPageState('done');
        }
      })
      .catch(() => setPageState('error'));
  }, [transactionId]);

  if (pageState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-petfy-grey-text text-sm">Verificando tu pago...</p>
      </div>
    );
  }

  if (pageState === 'error' || !result) {
    return (
      <div className="flex flex-col items-center text-center py-20 gap-4">
        <AlertCircle size={56} className="text-orange-400" />
        <h1 className="text-2xl font-extrabold text-navy">No pudimos verificar tu pago</h1>
        <p className="text-petfy-grey-text max-w-md">
          Hubo un problema al consultar el estado de tu transacción.
          Si el cobro fue exitoso, tu pedido quedó registrado y te contactaremos por WhatsApp.
        </p>
        <p className="text-sm text-petfy-grey-text">
          ¿Necesitas ayuda?{' '}
          <a
            href="https://wa.me/573177931145?text=Hola%20PetfyCo%2C%20tuve%20un%20problema%20verificando%20mi%20pago%20%F0%9F%90%BE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold underline"
          >
            Escríbenos por WhatsApp
          </a>
        </p>
        <Link href="/productos" className="btn-secondary mt-2">
          Volver a productos
        </Link>
      </div>
    );
  }

  if (result.status === 'APPROVED') {
    return (
      <div className="flex flex-col items-center text-center py-20 gap-5">
        <CheckCircle size={64} className="text-green-500" />
        <h1 className="text-3xl font-extrabold text-navy">¡Pago exitoso!</h1>
        <p className="text-petfy-grey-text max-w-md">
          Tu pago fue aprobado. Recibirás una confirmación por correo electrónico y te notificaremos
          por <strong>WhatsApp</strong> cuando tu pedido salga a domicilio.
        </p>
        {result.reference && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl px-8 py-4">
            <p className="text-xs text-green-700 uppercase tracking-widest font-semibold mb-1">Número de pedido</p>
            <p className="text-2xl font-extrabold text-green-800">{result.reference}</p>
          </div>
        )}
        <div className="flex gap-3 mt-2">
          <Link href="/pedidos" className="btn-primary">
            Ver mis pedidos
          </Link>
          <Link href="/productos" className="btn-secondary">
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  if (result.status === 'PENDING') {
    return (
      <div className="flex flex-col items-center text-center py-20 gap-5">
        <Clock size={64} className="text-yellow-500" />
        <h1 className="text-3xl font-extrabold text-navy">Pago en proceso</h1>
        <p className="text-petfy-grey-text max-w-md">
          Tu pago está siendo procesado. Esto puede tardar unos minutos.
          Te notificaremos por correo y WhatsApp cuando se confirme.
        </p>
        {result.reference && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl px-8 py-4">
            <p className="text-xs text-yellow-700 uppercase tracking-widest font-semibold mb-1">Número de pedido</p>
            <p className="text-2xl font-extrabold text-yellow-800">{result.reference}</p>
          </div>
        )}
        <div className="flex gap-3 mt-2">
          <Link href="/pedidos" className="btn-primary">
            Ver mis pedidos
          </Link>
          <a
            href="https://wa.me/573177931145?text=Hola%20PetfyCo%2C%20quiero%20verificar%20el%20estado%20de%20mi%20pago%20%F0%9F%90%BE"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // DECLINED, VOIDED, ERROR
  return (
    <div className="flex flex-col items-center text-center py-20 gap-5">
      <XCircle size={64} className="text-red-500" />
      <h1 className="text-3xl font-extrabold text-navy">Pago no completado</h1>
      <p className="text-petfy-grey-text max-w-md">
        {result.status === 'DECLINED'
          ? 'Tu pago fue rechazado. Verifica los datos de tu tarjeta o intenta con otro método de pago.'
          : 'La transacción fue cancelada o presentó un error. No se realizó ningún cobro.'}
      </p>
      {result.reference && (
        <p className="text-sm text-petfy-grey-text">
          Referencia: <span className="font-semibold text-navy">{result.reference}</span>
        </p>
      )}
      <div className="flex gap-3 mt-2">
        <Link href="/checkout" className="btn-primary flex items-center gap-2">
          <RotateCcw size={16} />
          Intentar de nuevo
        </Link>
        <Link href="/productos" className="btn-secondary">
          Volver a productos
        </Link>
      </div>
    </div>
  );
}

export default function PagoResultadoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-petfy-grey-text text-sm">Verificando tu pago...</p>
          </div>
        }
      >
        <ResultContent />
      </Suspense>
    </div>
  );
}
