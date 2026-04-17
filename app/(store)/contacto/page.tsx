import Link from 'next/link';
import { ChevronLeft, MessageCircle, Mail, Clock, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Contacto | PetfyCo',
  description: 'Contáctanos por WhatsApp o correo. Estamos para ayudarte.',
};

export default function ContactoPage() {
  const whatsapp = '573177931145';
  const whatsappMsg = encodeURIComponent('Hola PetfyCo, tengo una consulta 🐾');

  return (
    <div className="min-h-screen bg-petfy-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">

        <Link href="/" className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold mb-8 hover:underline">
          <ChevronLeft size={16} /> Volver al inicio
        </Link>

        <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 space-y-8">

          <div className="border-b border-gray-100 pb-6 text-center">
            <h1 className="text-3xl font-extrabold text-navy mb-2">¿Cómo podemos ayudarte?</h1>
            <p className="text-petfy-grey-text text-sm">Estamos listos para atenderte. Escríbenos y te respondemos rápido.</p>
          </div>

          {/* WhatsApp — canal principal */}
          <a
            href={`https://wa.me/${whatsapp}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-5 bg-green-50 border-2 border-green-200 rounded-2xl p-6 hover:bg-green-100 hover:border-green-300 transition-all group"
          >
            <div className="w-14 h-14 bg-[#25D366] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.054 23.447a.5.5 0 0 0 .604.604l5.584-1.478A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.888a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.716.983.997-3.648-.235-.374A9.862 9.862 0 0 1 2.113 12C2.113 6.533 6.533 2.113 12 2.113c5.467 0 9.887 4.42 9.887 9.887 0 5.467-4.42 9.888-9.887 9.888z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-0.5">Canal principal</p>
              <p className="text-lg font-extrabold text-navy">WhatsApp</p>
              <p className="text-petfy-grey-text text-sm">+57 317 793 1145</p>
            </div>
            <div className="text-green-500 font-bold text-sm hidden sm:block">Escribir →</div>
          </a>

          {/* Otros canales */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex gap-4 items-start bg-petfy-bg rounded-2xl p-5">
              <Mail size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-navy mb-0.5">Correo electrónico</p>
                <p className="text-petfy-grey-text text-sm">petfyco.sas@gmail.com</p>
                <p className="text-xs text-petfy-grey-text mt-1">Respuesta en 24 h hábiles</p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-petfy-bg rounded-2xl p-5">
              <Clock size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-navy mb-0.5">Horario de atención</p>
                <p className="text-petfy-grey-text text-sm">Lun – Sáb: 8 a.m. – 7 p.m.</p>
                <p className="text-xs text-petfy-grey-text mt-1">Dom: 9 a.m. – 3 p.m.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start bg-petfy-bg rounded-2xl p-5 sm:col-span-2">
              <MapPin size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-navy mb-0.5">Cobertura</p>
                <p className="text-petfy-grey-text text-sm">Servicio a domicilio en <strong>Medellín y su área metropolitana</strong> (Bello, Itagüí, Envigado, Sabaneta, La Estrella, Copacabana). Consulta disponibilidad por WhatsApp.</p>
              </div>
            </div>
          </div>

          {/* FAQ rápido */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <h2 className="text-base font-bold text-navy mb-4">Preguntas frecuentes</h2>
            {[
              { q: '¿Cuánto demora mi pedido?', a: 'Los pedidos se entregan en 1 a 3 días hábiles según tu ciudad.' },
              { q: '¿Puedo hacer seguimiento a mi pedido?', a: 'Sí, desde "Mis Pedidos" puedes ver el estado en tiempo real.' },
              { q: '¿Cómo hago una devolución?', a: 'Tienes 5 días hábiles desde la entrega. Escríbenos por WhatsApp.' },
            ].map(({ q, a }) => (
              <details key={q} className="group bg-petfy-bg rounded-xl overflow-hidden">
                <summary className="cursor-pointer px-5 py-3.5 text-sm font-semibold text-navy flex justify-between items-center select-none list-none">
                  {q}
                  <span className="text-primary text-lg leading-none group-open:rotate-45 transition-transform inline-block">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-petfy-grey-text leading-relaxed">{a}</p>
              </details>
            ))}
          </div>

          <div className="text-center">
            <a
              href={`https://wa.me/${whatsapp}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] text-white font-bold px-8 py-4 rounded-full hover:bg-[#1ebe5d] transition-colors shadow-md"
            >
              <MessageCircle size={20} />
              Chatear por WhatsApp
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
