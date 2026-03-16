import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Términos y Condiciones | PetfyCo',
  description: 'Términos y condiciones de uso de la plataforma PetfyCo.',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-petfy-bg py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <Link href="/" className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold mb-8 hover:underline">
          <ChevronLeft size={16} /> Volver al inicio
        </Link>

        <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 space-y-8">

          <div className="border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-extrabold text-navy mb-2">Términos y Condiciones</h1>
            <p className="text-sm text-petfy-grey-text">Última actualización: marzo de 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">1. Identificación del Responsable</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              <strong>PetfyCo</strong> es una empresa domiciliada en Colombia que opera la plataforma de comercio
              electrónico disponible en <span className="text-primary">petfyco.com</span>, dedicada
              a la prestación de servicios de nutrición y limpieza a domicilio para mascotas. El uso de esta
              plataforma implica la aceptación plena de los presentes Términos y Condiciones, de conformidad
              con la <strong>Ley 527 de 1999</strong> (comercio electrónico) y la{' '}
              <strong>Ley 1480 de 2011</strong> (Estatuto del Consumidor).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">2. Capacidad Legal</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Para utilizar la plataforma debe ser mayor de 18 años o contar con autorización de su representante
              legal. Al registrarse, declara que la información suministrada es veraz, completa y actualizada,
              bajo la responsabilidad establecida en el artículo 1.502 del Código Civil colombiano.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">3. Registro y Cuenta de Usuario</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.
              PetfyCo no será responsable por el uso no autorizado de su cuenta cuando dicho uso resulte del
              incumplimiento del usuario en la protección de sus datos de acceso. PetfyCo se reserva el
              derecho de cancelar cuentas que violen estos términos o la normativa vigente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">4. Productos y Servicios</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              PetfyCo comercializa productos de nutrición y servicios de limpieza a domicilio para mascotas.
              Las descripciones, imágenes y precios de los productos publicados en la plataforma son
              informativos y pueden estar sujetos a cambios sin previo aviso. Los precios incluyen IVA cuando
              aplique, conforme a la legislación tributaria colombiana. La disponibilidad de los productos
              está sujeta al inventario disponible al momento de la compra.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">5. Proceso de Compra y Pago</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              La realización de un pedido implica la aceptación de los presentes términos. El contrato de
              compraventa se perfecciona con la confirmación del pago. PetfyCo utiliza pasarelas de pago
              seguras y no almacena datos bancarios del usuario. En caso de cargo incorrecto, el usuario
              podrá ejercer los derechos previstos en la <strong>Ley 1480 de 2011</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">6. Derecho de Retracto y Devoluciones</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              De conformidad con el <strong>artículo 47 de la Ley 1480 de 2011</strong>, el consumidor
              tiene derecho a retractarse dentro de los <strong>cinco (5) días hábiles</strong> siguientes
              a la entrega del producto, siempre que no haya sido usado y se encuentre en su empaque original.
              Para ejercer este derecho, el usuario debe contactar a PetfyCo a través de los canales
              habilitados. Los gastos de devolución serán asumidos por el consumidor salvo defecto del
              producto. Los productos alimenticios perecederos están excluidos del derecho de retracto
              según la normativa vigente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">7. Garantía Legal</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              PetfyCo otorga la garantía mínima legal establecida en la <strong>Ley 1480 de 2011</strong>.
              En caso de producto defectuoso, el consumidor podrá solicitar la reparación, sustitución o
              devolución del precio pagado. La garantía no cubre daños causados por uso indebido o
              accidentes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">8. Entrega del Servicio a Domicilio</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Los tiempos de entrega son estimados y pueden variar según la zona de cobertura y
              disponibilidad. PetfyCo informará oportunamente al usuario en caso de retrasos
              significativos. La plataforma opera en Medellín y su área metropolitana.
              PetfyCo no se responsabiliza por demoras causadas por circunstancias ajenas a su
              control (fuerza mayor, orden público, condiciones climáticas).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">9. Propiedad Intelectual</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Todos los contenidos de la plataforma —incluyendo marca, logotipos, textos, imágenes y
              software— son propiedad de PetfyCo o de sus licenciantes y están protegidos por la
              <strong> Ley 23 de 1982</strong> sobre derechos de autor y la <strong>Decisión 486 de la CAN</strong>
              sobre propiedad industrial. Queda prohibida su reproducción sin autorización expresa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">10. Limitación de Responsabilidad</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              PetfyCo no será responsable por daños indirectos, incidentales o consecuentes derivados
              del uso de la plataforma, más allá de lo establecido en la normativa colombiana aplicable.
              La responsabilidad máxima de PetfyCo no excederá el valor del pedido que originó el reclamo.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">11. Ley Aplicable y Jurisdicción</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Los presentes términos se rigen por las leyes de la <strong>República de Colombia</strong>.
              Cualquier controversia será resuelta ante la Superintendencia de Industria y Comercio (SIC)
              o los jueces competentes de Colombia, conforme al Código General del Proceso
              (<strong>Ley 1564 de 2012</strong>). Antes de acudir a instancias judiciales, las partes
              procurarán resolución directa o mediante los mecanismos de la SIC (conciliación y arbitraje).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">12. Modificaciones</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              PetfyCo se reserva el derecho de modificar estos Términos en cualquier momento. Los cambios
              serán publicados en esta página con indicación de la fecha de actualización. El uso continuo
              de la plataforma tras la publicación de cambios constituye aceptación de los nuevos términos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">13. Contacto</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Para consultas sobre estos términos, puede comunicarse con nosotros a través de los
              canales de atención disponibles en la plataforma o al correo electrónico oficial de PetfyCo.
            </p>
          </section>

          <div className="border-t border-gray-100 pt-6 text-center">
            <Link href="/privacidad" className="text-primary text-sm font-semibold hover:underline">
              Ver Política de Privacidad →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
