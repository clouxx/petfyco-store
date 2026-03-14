import Link from 'next/link';
import { ChevronLeft, Truck, Clock, MapPin, PackageCheck, AlertCircle, Phone } from 'lucide-react';

export const metadata = {
  title: 'Política de Envíos | PetfyCo',
  description: 'Conoce nuestra política de envíos y tiempos de entrega a domicilio en Medellín y su área metropolitana.',
};

export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-petfy-bg py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <Link href="/" className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold mb-8 hover:underline">
          <ChevronLeft size={16} /> Volver al inicio
        </Link>

        <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 space-y-8">

          <div className="border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-extrabold text-navy mb-2">Política de Envíos</h1>
            <p className="text-sm text-petfy-grey-text">Última actualización: marzo de 2026</p>
          </div>

          {/* Tarjetas resumen */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-2xl p-5 text-center">
              <Truck size={28} className="text-primary mx-auto mb-2" />
              <p className="text-sm font-bold text-navy">100% a domicilio</p>
              <p className="text-xs text-petfy-grey-text mt-1">Sin necesidad de ir a una tienda</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-5 text-center">
              <Clock size={28} className="text-accent mx-auto mb-2" />
              <p className="text-sm font-bold text-navy">1 a 3 días hábiles</p>
              <p className="text-xs text-petfy-grey-text mt-1">Tiempo estimado de entrega</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-5 text-center">
              <PackageCheck size={28} className="text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-navy">Gratis desde $150.000</p>
              <p className="text-xs text-petfy-grey-text mt-1">En compras que superen este valor</p>
            </div>
          </div>

          {/* Zona de cobertura */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary flex-shrink-0" />
              <h2 className="text-lg font-bold text-navy">1. Zona de Cobertura</h2>
            </div>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              PetfyCo realiza entregas a domicilio exclusivamente en <strong>Medellín y su área metropolitana</strong>,
              que incluye los municipios de <strong>Bello, Itagüí, Envigado, Sabaneta, La Estrella y Copacabana</strong>.
            </p>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Si tu dirección está fuera de esta zona de cobertura, te recomendamos contactarnos por WhatsApp antes
              de realizar tu pedido para verificar disponibilidad.
            </p>
          </section>

          {/* Costos de envío */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-primary flex-shrink-0" />
              <h2 className="text-lg font-bold text-navy">2. Costos de Envío</h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-petfy-bg">
                  <tr>
                    <th className="text-left px-5 py-3 text-navy font-bold">Valor del pedido</th>
                    <th className="text-left px-5 py-3 text-navy font-bold">Costo de envío</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="px-5 py-3 text-petfy-grey-text">Menos de $150.000</td>
                    <td className="px-5 py-3 text-petfy-grey-text">$8.000 – $12.000 según zona</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-green-50">
                    <td className="px-5 py-3 text-navy font-semibold">$150.000 o más</td>
                    <td className="px-5 py-3 text-primary font-bold">¡Envío GRATIS!</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-petfy-grey-text">
              * Los costos de envío pueden variar según la zona específica dentro del área metropolitana.
              El valor exacto se confirmará al momento de procesar tu pedido.
            </p>
          </section>

          {/* Tiempos de entrega */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary flex-shrink-0" />
              <h2 className="text-lg font-bold text-navy">3. Tiempos de Entrega</h2>
            </div>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Una vez confirmado el pago, procesamos tu pedido en el menor tiempo posible:
            </p>
            <ul className="space-y-2 text-sm text-petfy-grey-text">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span><strong className="text-navy">Medellín (zona urbana):</strong> 1 día hábil.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span><strong className="text-navy">Área metropolitana:</strong> 1 a 2 días hábiles.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span><strong className="text-navy">Zonas con dificultad de acceso:</strong> hasta 3 días hábiles.</span>
              </li>
            </ul>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Los tiempos son estimados en días <strong>hábiles</strong> (lunes a sábado). Los pedidos realizados
              después de las <strong>3:00 p.m.</strong> se procesarán el siguiente día hábil.
            </p>
          </section>

          {/* Seguimiento */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <PackageCheck size={18} className="text-primary flex-shrink-0" />
              <h2 className="text-lg font-bold text-navy">4. Seguimiento del Pedido</h2>
            </div>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Puedes consultar el estado de tu pedido en cualquier momento desde la sección{' '}
              <Link href="/pedidos" className="text-primary font-semibold hover:underline">Mis Pedidos</Link>{' '}
              dentro de tu cuenta. Además, te notificaremos por WhatsApp cuando tu pedido salga a domicilio.
            </p>
          </section>

          {/* Condiciones */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-primary flex-shrink-0" />
              <h2 className="text-lg font-bold text-navy">5. Condiciones y Responsabilidad</h2>
            </div>
            <ul className="space-y-2 text-sm text-petfy-grey-text list-disc list-inside leading-relaxed">
              <li>Es responsabilidad del cliente suministrar una dirección completa y correcta al momento de realizar el pedido.</li>
              <li>PetfyCo no se hace responsable por demoras ocasionadas por información incorrecta del cliente.</li>
              <li>En caso de ausencia del destinatario, el domiciliario intentará contactarte. Si no es posible la entrega, se reprogramará para el siguiente día hábil.</li>
              <li>PetfyCo no se responsabiliza por retrasos debidos a causas de fuerza mayor (paro, lluvias extremas, orden público).</li>
              <li>Los productos perecederos (alimentos para mascotas) requieren que haya alguien en casa para recibirlos.</li>
            </ul>
          </section>

          {/* Contacto */}
          <section className="bg-petfy-bg rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-primary flex-shrink-0" />
              <h2 className="text-base font-bold text-navy">¿Tienes preguntas sobre tu envío?</h2>
            </div>
            <p className="text-petfy-grey-text text-sm">
              Escríbenos por WhatsApp y te respondemos rápidamente.
            </p>
            <a
              href="https://wa.me/573177931145?text=Hola%20PetfyCo%2C%20tengo%20una%20consulta%20sobre%20mi%20env%C3%ADo%20%F0%9F%90%BE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-full hover:bg-[#1ebe5d] transition-colors text-sm shadow-md"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.054 23.447a.5.5 0 0 0 .604.604l5.584-1.478A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.888a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.716.983.997-3.648-.235-.374A9.862 9.862 0 0 1 2.113 12C2.113 6.533 6.533 2.113 12 2.113c5.467 0 9.887 4.42 9.887 9.887 0 5.467-4.42 9.888-9.887 9.888z"/>
              </svg>
              Consultar por WhatsApp
            </a>
          </section>

          <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/devoluciones" className="text-primary font-semibold hover:underline">
              Ver Política de Devoluciones →
            </Link>
            <Link href="/terminos" className="text-primary font-semibold hover:underline">
              Ver Términos y Condiciones →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
