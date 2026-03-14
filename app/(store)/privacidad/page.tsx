import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad | PetfyCo',
  description: 'Política de tratamiento de datos personales de PetfyCo conforme a la Ley 1581 de 2012.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-petfy-bg py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <Link href="/" className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold mb-8 hover:underline">
          <ChevronLeft size={16} /> Volver al inicio
        </Link>

        <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 space-y-8">

          <div className="border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-extrabold text-navy mb-2">Política de Privacidad y Tratamiento de Datos Personales</h1>
            <p className="text-sm text-petfy-grey-text">Última actualización: marzo de 2026</p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <p className="text-sm text-primary font-semibold">
              Esta política cumple con la <strong>Ley Estatutaria 1581 de 2012</strong> de Protección de Datos
              Personales, el <strong>Decreto 1074 de 2015</strong> (Decreto Único Reglamentario del Sector
              Comercio) y las instrucciones de la <strong>Superintendencia de Industria y Comercio (SIC)</strong>.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">1. Responsable del Tratamiento</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              <strong>PetfyCo</strong> es el responsable del tratamiento de los datos personales recolectados
              a través de la plataforma <span className="text-primary">petfyco-store.vercel.app</span>.
              Para ejercer sus derechos o plantear consultas, puede contactarnos a través de los canales
              habilitados en la plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">2. Datos Personales que Recopilamos</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed mb-2">
              Recopilamos los siguientes datos personales según las interacciones del usuario:
            </p>
            <ul className="space-y-1.5 text-sm text-petfy-grey-text">
              {[
                'Nombre completo y correo electrónico (registro de cuenta)',
                'Dirección de entrega, ciudad y departamento (pedidos a domicilio)',
                'Número de teléfono de contacto (coordinación de entregas)',
                'Historial de pedidos y productos adquiridos',
                'Datos de navegación y preferencias de uso de la plataforma (cookies)',
                'Información de pago procesada por pasarela segura (PetfyCo no almacena datos bancarios)',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">3. Finalidades del Tratamiento</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed mb-2">
              Sus datos personales serán tratados para las siguientes finalidades:
            </p>
            <ul className="space-y-1.5 text-sm text-petfy-grey-text">
              {[
                'Gestión del registro, autenticación y mantenimiento de la cuenta de usuario',
                'Procesamiento, confirmación y entrega de pedidos a domicilio',
                'Atención al cliente, soporte posventa y gestión de garantías',
                'Envío de comunicaciones transaccionales (confirmación de pedidos, estados de entrega)',
                'Envío de comunicaciones comerciales y promocionales, previo consentimiento expreso',
                'Cumplimiento de obligaciones legales, contables y tributarias',
                'Mejora de la experiencia de usuario y análisis estadístico de la plataforma',
                'Prevención de fraudes y seguridad de la plataforma',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">4. Base Legal del Tratamiento</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              El tratamiento de sus datos personales se fundamenta en:
            </p>
            <ul className="space-y-1.5 text-sm text-petfy-grey-text mt-2">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><strong>Consentimiento:</strong> otorgado al momento del registro o de la aceptación de comunicaciones comerciales.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><strong>Ejecución contractual:</strong> necesario para la prestación del servicio solicitado.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><strong>Obligación legal:</strong> cumplimiento de normas tributarias, contables y de comercio electrónico colombianas.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><strong>Interés legítimo:</strong> prevención de fraudes y seguridad de la plataforma.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">5. Derechos del Titular (Artículo 8, Ley 1581 de 2012)</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed mb-2">
              Como titular de datos personales, usted tiene los siguientes derechos:
            </p>
            <ul className="space-y-1.5 text-sm text-petfy-grey-text">
              {[
                'Conocer, actualizar y rectificar sus datos personales',
                'Solicitar prueba de la autorización otorgada para el tratamiento',
                'Ser informado sobre el uso que se ha dado a sus datos',
                'Presentar quejas ante la Superintendencia de Industria y Comercio (SIC)',
                'Revocar la autorización y/o solicitar la supresión de sus datos, cuando proceda legalmente',
                'Acceder gratuitamente a sus datos personales que hayan sido objeto de tratamiento',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-petfy-grey-text text-sm leading-relaxed mt-2">
              Para ejercer estos derechos, puede contactarnos a través de los canales habilitados. Daremos
              respuesta en los términos establecidos por la Ley 1581 de 2012 (10 días hábiles para consultas,
              15 días hábiles para reclamos).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">6. Transferencia y Transmisión de Datos</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              PetfyCo podrá compartir sus datos con terceros únicamente en los siguientes casos:
            </p>
            <ul className="space-y-1.5 text-sm text-petfy-grey-text mt-2">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><strong>Supabase (proveedor de infraestructura):</strong> almacenamiento seguro de datos bajo estándares internacionales.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><strong>Pasarelas de pago:</strong> para el procesamiento seguro de transacciones.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><strong>Operadores logísticos:</strong> para la coordinación de entregas a domicilio.</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><strong>Autoridades competentes:</strong> cuando exista obligación legal o requerimiento judicial.</li>
            </ul>
            <p className="text-petfy-grey-text text-sm leading-relaxed mt-2">
              Toda transmisión a encargados del tratamiento se realiza mediante cláusulas contractuales que
              garantizan niveles de protección equivalentes a los exigidos por la normativa colombiana.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">7. Seguridad de los Datos</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              PetfyCo implementa medidas técnicas, administrativas y físicas para proteger sus datos
              personales contra acceso no autorizado, pérdida, destrucción o alteración, conforme
              al <strong>artículo 17 de la Ley 1581 de 2012</strong>. Entre estas medidas se incluyen:
              cifrado SSL/TLS en las comunicaciones, control de acceso por roles, autenticación segura
              mediante Supabase Auth, y monitoreo continuo de la plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">8. Tiempo de Conservación</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Sus datos personales se conservarán durante el tiempo necesario para cumplir las finalidades
              descritas y las obligaciones legales aplicables. Los datos de transacciones comerciales se
              conservan por un mínimo de <strong>5 años</strong> conforme a la legislación tributaria
              colombiana (<strong>Estatuto Tributario, artículo 632</strong>). Una vez cumplido el plazo,
              los datos serán suprimidos o anonimizados de forma segura.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">9. Uso de Cookies</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              La plataforma utiliza cookies técnicas necesarias para el funcionamiento del servicio y
              cookies analíticas para mejorar la experiencia de usuario. El uso de cookies analíticas
              está sujeto a su consentimiento. Puede configurar su navegador para rechazar cookies,
              aunque esto puede afectar la funcionalidad de la plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">10. Menores de Edad</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              PetfyCo no recopila intencionalmente datos de menores de 18 años sin autorización de sus
              representantes legales. Si detectamos que hemos recopilado datos de un menor sin autorización,
              procederemos a su eliminación inmediata, conforme al <strong>artículo 7 de la Ley 1581 de 2012</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">11. Canales de Atención y Quejas</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              Para consultas, reclamos o ejercicio de derechos relacionados con sus datos personales,
              puede contactarnos a través de los canales habilitados en la plataforma. Si considera que
              su solicitud no fue atendida satisfactoriamente, puede acudir ante la{' '}
              <strong>Superintendencia de Industria y Comercio (SIC)</strong> en{' '}
              <span className="text-primary">www.sic.gov.co</span>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy">12. Modificaciones a esta Política</h2>
            <p className="text-petfy-grey-text text-sm leading-relaxed">
              PetfyCo podrá modificar esta política en cualquier momento. Los cambios serán publicados
              en esta página con la fecha de actualización. Si los cambios son sustanciales, notificaremos
              a los usuarios registrados por correo electrónico. El uso continuado de la plataforma
              constituye aceptación de los cambios.
            </p>
          </section>

          <div className="border-t border-gray-100 pt-6 text-center">
            <Link href="/terminos" className="text-primary text-sm font-semibold hover:underline">
              Ver Términos y Condiciones →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
