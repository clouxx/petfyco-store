'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, ChevronRight, Truck, CreditCard } from 'lucide-react';
import { supabase, formatCOP } from '@/lib/supabase';
import { useCartStore } from '@/lib/cart-store';
import toast from 'react-hot-toast';

const COLOMBIA_DEPTOS = [
  'Amazonas','Antioquia','Arauca','Atlántico','Bolívar','Boyacá','Caldas','Caquetá',
  'Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca','Guainía','Guaviare',
  'Huila','La Guajira','Magdalena','Meta','Nariño','Norte de Santander','Putumayo',
  'Quindío','Risaralda','San Andrés y Providencia','Santander','Sucre','Tolima',
  'Valle del Cauca','Vaupés','Vichada',
];

const billingSchema = z.object({
  billing_id_type: z.enum(['CC','NIT','CE','PA']),
  billing_id: z.string().min(5, 'ID requerido'),
  billing_name: z.string().min(2, 'Nombre requerido'),
  billing_razon_social: z.string().optional(),
  billing_email: z.string().email('Correo inválido'),
  billing_phone: z.string().min(7, 'Teléfono requerido'),
  billing_address: z.string().min(5, 'Dirección requerida'),
  billing_city: z.string().min(2, 'Ciudad requerida'),
  billing_depto: z.string().min(2, 'Departamento requerido'),
  delivery_same: z.boolean().optional(),
  delivery_address: z.string().optional(),
  delivery_city: z.string().optional(),
  delivery_depto: z.string().optional(),
});

type BillingData = z.infer<typeof billingSchema>;

type Step = 1 | 2 | 3;

const FREE_SHIPPING = 150000;
const SHIPPING_COST = 8000;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>(1);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<'domicilio' | 'gratis'>('domicilio');
  const [submitting, setSubmitting] = useState(false);

  const cartTotal = total();
  const isFreeShipping = cartTotal >= FREE_SHIPPING;
  const shipping = isFreeShipping ? 0 : deliveryOption === 'gratis' ? 0 : SHIPPING_COST;
  const orderTotal = cartTotal + shipping;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BillingData>({
    resolver: zodResolver(billingSchema),
    defaultValues: { billing_id_type: 'CC', delivery_same: true },
  });

  const deliverySame = watch('delivery_same');

  const onBillingSubmit = (data: BillingData) => {
    setBillingData(data);
    setStep(2);
  };

  const createOrder = async (paymentMethod: string) => {
    if (!billingData || items.length === 0) return;
    setSubmitting(true);
    try {
      const orderNumber = 'PFC-' + Date.now().toString().slice(-8);
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;

      const orderPayload = {
        order_number: orderNumber,
        user_id: userId || null,
        status: 'pending' as const,
        subtotal: cartTotal,
        discount: 0,
        shipping,
        total: orderTotal,
        billing_name: billingData.billing_name,
        billing_id_type: billingData.billing_id_type,
        billing_id: billingData.billing_id,
        billing_razon_social: billingData.billing_razon_social || null,
        billing_email: billingData.billing_email,
        billing_phone: billingData.billing_phone,
        billing_address: billingData.billing_address,
        billing_city: billingData.billing_city,
        billing_depto: billingData.billing_depto,
        delivery_address: deliverySame ? billingData.billing_address : billingData.delivery_address,
        delivery_city: deliverySame ? billingData.billing_city : billingData.delivery_city,
        delivery_depto: deliverySame ? billingData.billing_depto : billingData.delivery_depto,
        payment_method: paymentMethod,
        payment_status: 'pending',
      };

      const { data: order, error: orderError } = await supabase
        .from('store_orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_sku: item.product.sku || null,
        unit_price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('store_order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      toast.success('¡Pedido creado exitosamente!');
      router.push(`/pedidos?order=${order.order_number}`);
    } catch (err) {
      console.error(err);
      toast.error('Error al crear el pedido. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    router.push('/carrito');
    return null;
  }

  const steps = [
    { n: 1, label: 'Facturación' },
    { n: 2, label: 'Revisión' },
    { n: 3, label: 'Pago' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-navy mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center mb-10">
        {steps.map((s, idx) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-primary text-white' : 'bg-gray-200 text-petfy-grey-text'
              }`}>
                {step > s.n ? <Check size={16} /> : s.n}
              </div>
              <span className={`text-sm font-semibold hidden sm:block ${step === s.n ? 'text-primary' : step > s.n ? 'text-green-600' : 'text-petfy-grey-text'}`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-3 bg-gray-200">
                <div className={`h-full bg-primary transition-all ${step > s.n ? 'w-full' : 'w-0'}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* STEP 1: Billing */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onBillingSubmit)} className="bg-white rounded-2xl shadow-card p-8 space-y-5">
              <h2 className="text-xl font-bold text-navy">Datos de Facturación</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Tipo de ID *</label>
                  <select {...register('billing_id_type')} className="input-field">
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">Cédula Extranjería</option>
                    <option value="PA">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Número de ID *</label>
                  <input {...register('billing_id')} className="input-field" placeholder="1234567890" />
                  {errors.billing_id && <p className="text-red-500 text-xs mt-1">{errors.billing_id.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Nombre completo / Razón Social *</label>
                <input {...register('billing_name')} className="input-field" placeholder="Tu nombre completo" />
                {errors.billing_name && <p className="text-red-500 text-xs mt-1">{errors.billing_name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Correo electrónico *</label>
                  <input {...register('billing_email')} type="email" className="input-field" placeholder="tu@correo.com" />
                  {errors.billing_email && <p className="text-red-500 text-xs mt-1">{errors.billing_email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Teléfono *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-petfy-grey text-sm text-navy">+57</span>
                    <input {...register('billing_phone')} className="input-field rounded-l-none" placeholder="3001234567" />
                  </div>
                  {errors.billing_phone && <p className="text-red-500 text-xs mt-1">{errors.billing_phone.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Dirección *</label>
                <input {...register('billing_address')} className="input-field" placeholder="Calle 123 # 45-67, Apt 8" />
                {errors.billing_address && <p className="text-red-500 text-xs mt-1">{errors.billing_address.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Departamento *</label>
                  <select {...register('billing_depto')} className="input-field">
                    <option value="">Seleccionar</option>
                    {COLOMBIA_DEPTOS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.billing_depto && <p className="text-red-500 text-xs mt-1">{errors.billing_depto.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Ciudad *</label>
                  <input {...register('billing_city')} className="input-field" placeholder="Bogotá" />
                  {errors.billing_city && <p className="text-red-500 text-xs mt-1">{errors.billing_city.message}</p>}
                </div>
              </div>

              {/* Delivery address toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register('delivery_same')} className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4" />
                  <span className="text-sm font-medium text-navy">Dirección de entrega igual a la de facturación</span>
                </label>
              </div>

              {!deliverySame && (
                <div className="pt-2 space-y-4 border-t border-gray-100">
                  <h3 className="font-semibold text-navy">Dirección de entrega</h3>
                  <input {...register('delivery_address')} className="input-field" placeholder="Dirección de entrega" />
                  <div className="grid grid-cols-2 gap-4">
                    <select {...register('delivery_depto')} className="input-field">
                      <option value="">Departamento</option>
                      {COLOMBIA_DEPTOS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input {...register('delivery_city')} className="input-field" placeholder="Ciudad" />
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                Continuar
                <ChevronRight size={18} />
              </button>
            </form>
          )}

          {/* STEP 2: Review */}
          {step === 2 && billingData && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h2 className="text-xl font-bold text-navy mb-5">Revisar Pedido</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => {
                    const img = item.product.images?.[0] || 'https://images.unsplash.com/photo-1601758064978-4e9c55a11fcb?w=80&h=80&fit=crop';
                    return (
                      <div key={item.product.id} className="flex gap-4 items-center">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-petfy-grey flex-shrink-0">
                          <Image src={img} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-navy">{item.product.name}</p>
                          <p className="text-xs text-petfy-grey-text">x{item.quantity}</p>
                        </div>
                        <p className="font-bold text-navy">{formatCOP(item.product.price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery options */}
                <div className="border-t border-gray-100 pt-5">
                  <h3 className="font-semibold text-navy mb-3">Opción de entrega</h3>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryOption === 'domicilio' && !isFreeShipping ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        value="domicilio"
                        checked={!isFreeShipping && deliveryOption === 'domicilio'}
                        onChange={() => setDeliveryOption('domicilio')}
                        disabled={isFreeShipping}
                        className="accent-primary"
                      />
                      <Truck size={20} className="text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-navy text-sm">Envío a domicilio</p>
                        <p className="text-xs text-petfy-grey-text">3-5 días hábiles</p>
                      </div>
                      <span className="font-bold text-navy text-sm">
                        {isFreeShipping ? <span className="text-green-600">Gratis</span> : formatCOP(SHIPPING_COST)}
                      </span>
                    </label>
                    {isFreeShipping && (
                      <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-green-400 bg-green-50">
                        <Check size={20} className="text-green-500" />
                        <p className="text-sm font-semibold text-green-700">¡Envío gratis por compra mayor a $150.000!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Billing info summary */}
                <div className="border-t border-gray-100 pt-5 mt-5">
                  <h3 className="font-semibold text-navy mb-3">Datos de facturación</h3>
                  <div className="bg-petfy-grey rounded-xl p-4 text-sm space-y-1">
                    <p className="font-medium">{billingData.billing_name} — {billingData.billing_id_type}: {billingData.billing_id}</p>
                    <p className="text-petfy-grey-text">{billingData.billing_email} | +57 {billingData.billing_phone}</p>
                    <p className="text-petfy-grey-text">{billingData.billing_address}, {billingData.billing_city}, {billingData.billing_depto}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 text-sm py-3.5">
                  Editar datos
                </button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-3.5">
                  Ir al pago
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h2 className="text-xl font-bold text-navy mb-6">Método de pago</h2>

                {/* Wompi */}
                <div className="border-2 border-primary rounded-2xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard size={24} className="text-primary" />
                    <div>
                      <h3 className="font-bold text-navy">Pagar con Wompi</h3>
                      <p className="text-xs text-petfy-grey-text">Tarjeta débito/crédito, PSE, Nequi, Bancolombia</p>
                    </div>
                  </div>
                  <button
                    onClick={() => createOrder('wompi')}
                    disabled={submitting}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
                  >
                    {submitting ? 'Procesando...' : `Pagar ${formatCOP(orderTotal)} con Wompi`}
                  </button>
                </div>

                {/* Bank Transfer */}
                <div className="border-2 border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-navy mb-3">Transferencia bancaria</h3>
                  <div className="bg-petfy-grey rounded-xl p-4 text-sm space-y-1.5 mb-4">
                    <p><span className="font-semibold">Banco:</span> Bancolombia</p>
                    <p><span className="font-semibold">Cuenta ahorros:</span> 123-456789-00</p>
                    <p><span className="font-semibold">NIT:</span> 901234567-8</p>
                    <p><span className="font-semibold">Titular:</span> PetfyCo S.A.S.</p>
                    <p className="text-petfy-grey-text text-xs mt-2">
                      Envía el comprobante a pagos@petfyco.com con tu número de pedido
                    </p>
                  </div>
                  <button
                    onClick={() => createOrder('transferencia')}
                    disabled={submitting}
                    className="btn-secondary w-full py-3.5 text-sm"
                  >
                    {submitting ? 'Procesando...' : 'Confirmar pedido (pago por transferencia)'}
                  </button>
                </div>
              </div>

              <button onClick={() => setStep(2)} className="text-primary text-sm font-medium hover:text-accent transition-colors">
                ← Volver a revisión
              </button>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
            <h3 className="font-bold text-navy mb-4">Tu pedido</h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-navy line-clamp-1 flex-1 mr-2">{item.product.name} x{item.quantity}</span>
                  <span className="font-medium text-navy flex-shrink-0">{formatCOP(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-petfy-grey-text">Subtotal</span>
                <span className="font-medium">{formatCOP(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-petfy-grey-text">Envío</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                  {shipping === 0 ? 'Gratis' : formatCOP(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-extrabold text-navy text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-primary">{formatCOP(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
