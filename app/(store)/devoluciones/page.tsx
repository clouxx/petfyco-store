import Link from 'next/link';
import { ChevronLeft, RotateCcw, AlertCircle, CheckCircle, Phone } from 'lucide-react';

export const metadata = {
  title: 'Política de Devoluciones | PetfyCo',
  description: 'Política de devoluciones y derecho de retracto de PetfyCo conforme a la Ley 1480 de 2011.',
};

export default function DevolucionesPage() {
  return (
    <div className="min-h-screen bg-petfy-bg py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <Link href="/" className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold mb-8 hover:underline">
          <ChevronLeft size={16} /> Volver al inicio
        </Link>

        <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 space-y-8">

          <div className="border-b border-gray-100 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <RotateCcw size={28} className="text-primary" />
              <h1 className="text-3xl font-extrabold text-navy">Política de Devoluciones</h1>
            </div>
            <p className="text-sm text-petfy-grey-text">Última actualización: marzo de 2026 · Vigente conforme a la <strong>Ley 1480 de 2011</strong> (Estatuto del Consumidor)</p>
          </div>

          {/* Resumen visual */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-2xl p-4 text-center">
              <p className="text-3xl font-extrabold text-primary">5</p>
              <p className="text-sm font-semibold text-navy mt-1">días hábiles</p>
              <p className="text-xs text-petfy-grey-text mt-0.5">para retractarse</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 text-center">
              <p className="text-3xl font-extrabold text-accent">30</p>
              <p className="text-sm font-semibold text-navy mt-1">días calendario</p>
              <p className="text-xs text-petfy-grey-text mt-0.5">garantía mínima legal</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 text-center">
              <p className="text-3xl font-extrabold text-blue-500">100%</p>
              <p className="text-sm font-semibold text-navy mt-1">reembolso</p>
              <p className="text-xs text-petfy-grey-text mt-0.5">en productos defectuosos</p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">1. Derecho de Retracto</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Conforme al <strong>artículo 47 de la Ley 1480 de 2011</strong>, todo consumidor que adquiera
              productos a través de medios no tradicionales o a distancia (comercio electrónico) tiene derecho
              a retractarse dentro de los <strong>cinco (5) días hábiles</strong> contados a partir de la
              entrega del producto, sin necesidad de expresar causa alguna y sin penalidad.
            </p>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Para ejercer el derecho de retracto, el producto debe encontrarse en perfectas condiciones,
              sin uso, sin daños y en su empaque original con todos sus accesorios y documentos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">2. Productos Excluidos del Retracto</h2>
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3">
              <AlertCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-petfy-grey-text leading-relaxed">
                Los <strong>alimentos, croquetas y productos perecederos</strong> están excluidos del derecho
                de retracto una vez abierto su empaque, según el numeral 4 del artículo 47 de la Ley 1480 de
                2011, por razones de higiene y salud animal. Si el producto llega en mal estado o vencido,
                aplica la garantía legal (ver sección 4).
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">3. Proceso de Devolución</h2>
            <ol className="space-y-3">
              {[
                { step: '1', text: 'Contáctanos dentro del plazo legal por WhatsApp o correo electrónico e indícanos el número de pedido y el motivo.' },
                { step: '2', text: 'Te confirmaremos la solicitud en un máximo de 24 horas hábiles y te indicaremos la dirección de envío de devolución.' },
                { step: '3', text: 'Empaca el producto en su empaque original con todos los accesorios y envíalo. Los costos de envío corren por cuenta del consumidor, salvo cuando el motivo sea un defecto del producto.' },
                { step: '4', text: 'Una vez recibido y verificado el producto, procesaremos el reembolso en un plazo máximo de 15 días hábiles a través del mismo medio de pago utilizado.' },
              ].map(({ step, text }) => (
                <li key={step} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">{step}</span>
                  <p className="text-petfy-grey-text text-sm leading-relaxed pt-1">{text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">4. Garantía Legal por Producto Defectuoso</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Conforme al <strong>artículo 7 de la Ley 1480 de 2011</strong>, PetfyCo garantiza que todos los
              productos vendidos están libres de defectos de fabricación. Si recibes un producto defectuoso,
              dañado en el envío o diferente al pedido, tienes derecho a:
            </p>
            <div className="space-y-2">
              {[
                'Reparación o reposición del producto.',
                'Devolución del precio pagado en su totalidad.',
                'Descuento proporcional al defecto, si así lo prefieres.',
              ].map((item) => (
                <div key={item} className="flex gap-2.5 items-start">
                  <CheckCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-petfy-grey-text text-sm">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              En este caso, PetfyCo asumirá los costos de envío de la devolución. Deberás reportar el
              defecto dentro de los <strong>30 días calendario</strong> siguientes a la recepción del producto.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">5. Reembolsos</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Los reembolsos se procesarán por el mismo medio de pago utilizado en la compra:
            </p>
            <ul className="space-y-1.5 text-sm text-petfy-grey-text">
              <li className="flex gap-2"><span className="text-primary font-bold">·</span> <span><strong>Tarjeta de crédito/débito:</strong> hasta 15 días hábiles (según el banco emisor).</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">·</span> <span><strong>Transferencia PSE:</strong> hasta 5 días hábiles.</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">·</span> <span><strong>Efectivo (Efecty/Baloto):</strong> se realizará por transferencia bancaria a la cuenta que indiques.</span></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">6. Casos No Cubiertos</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              La garantía y el derecho de retracto <strong>no aplican</strong> cuando:
            </p>
            <ul className="space-y-1.5 text-sm text-petfy-grey-text">
              <li className="flex gap-2"><span className="text-accent font-bold">·</span> El producto ha sido usado, modificado o dañado por el consumidor.</li>
              <li className="flex gap-2"><span className="text-accent font-bold">·</span> Se ha superado el plazo legal aplicable (5 días hábiles para retracto / 30 días para defectos).</li>
              <li className="flex gap-2"><span className="text-accent font-bold">·</span> El daño es consecuencia de uso inadecuado, almacenamiento incorrecto o accidente.</li>
              <li className="flex gap-2"><span className="text-accent font-bold">·</span> Alimentos perecederos en buen estado que ya fueron abiertos.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">7. Normativa Aplicable</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Esta política se rige por la legislación colombiana, en particular:
            </p>
            <ul className="space-y-1 text-sm text-petfy-grey-text">
              <li className="flex gap-2"><span className="text-primary font-bold">·</span> <strong>Ley 1480 de 2011</strong> — Estatuto del Consumidor.</li>
              <li className="flex gap-2"><span className="text-primary font-bold">·</span> <strong>Ley 527 de 1999</strong> — Comercio electrónico en Colombia.</li>
              <li className="flex gap-2"><span className="text-primary font-bold">·</span> <strong>Decreto 1499 de 2014</strong> — Reglamento del Estatuto del Consumidor.</li>
              <li className="flex gap-2"><span className="text-primary font-bold">·</span> Resoluciones de la <strong>Superintendencia de Industria y Comercio (SIC)</strong>.</li>
            </ul>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Si consideras que tus derechos como consumidor han sido vulnerados, puedes radicar una queja
              ante la SIC en <strong>sic.gov.co</strong> o llamar al <strong>601 592 0400</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <div className="bg-petfy-bg rounded-2xl p-6 flex gap-4 items-start">
              <Phone size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-bold text-navy mb-1">¿Necesitas ayuda?</h2>
                <p className="text-petfy-grey-text text-sm leading-relaxed">
                  Contáctanos a través de los canales de atención disponibles en la plataforma.
                  Nuestro equipo te atenderá en un plazo máximo de <strong>24 horas hábiles</strong>.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-gray-100 pt-6 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/terminos" className="text-primary font-semibold hover:underline">
              Términos y Condiciones
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/privacidad" className="text-primary font-semibold hover:underline">
              Política de Privacidad
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
