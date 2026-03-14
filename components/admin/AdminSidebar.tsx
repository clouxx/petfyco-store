'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingBag,
  FileText,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/catalogo', label: 'Catálogo', icon: Package },
  { href: '/admin/inventario', label: 'Inventario', icon: Warehouse },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/facturacion', label: 'Facturación', icon: FileText },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-navy text-white sticky top-0 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } flex-shrink-0`}
    >
      {/* Logo */}
      <div className={`flex items-center h-20 px-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        {collapsed ? (
          <Image
            src="/petfyco_nutricion_sin_fondo.png"
            alt="PetfyCo"
            width={36}
            height={36}
            className="object-contain flex-shrink-0"
            style={{ filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 6px white) drop-shadow(0 0 10px rgba(255,255,255,0.6))' }}
            priority
          />
        ) : (
          <div className="flex flex-col items-start py-2">
            <Image
              src="/petfyco_nutricion_sin_fondo.png"
              alt="PetfyCo"
              width={130}
              height={52}
              className="object-contain"
              style={{ filter: 'drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0 0 6px white) drop-shadow(0 0 10px white) drop-shadow(0 0 16px rgba(255,255,255,0.6))' }}
              priority
            />
            <p className="text-xs text-gray-400 leading-none pl-1">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
              isActive(href)
                ? 'bg-primary text-white font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Collapse button */}
      <div className="px-2 pb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} />
              <span>Colapsar</span>
            </>
          )}
        </button>
      </div>

      {/* User info + Logout */}
      <div className="border-t border-white/10 p-3">
        <div className={`flex items-center gap-3 px-2 py-2 mb-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <User size={14} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">Admin</p>
              <p className="text-xs text-gray-400 truncate">PetfyCo</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
