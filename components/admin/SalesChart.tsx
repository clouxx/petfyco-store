'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCOP } from '@/lib/supabase';

interface DailySales { date: string; total: number }

export default function SalesChart({ data }: { data: DailySales[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4CB5F9" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4CB5F9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F6F9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#757575' }} tickLine={false} axisLine={false} interval={4} />
        <YAxis
          tick={{ fontSize: 11, fill: '#757575' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(v: number) => [formatCOP(v), 'Ventas']}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
        />
        <Area type="monotone" dataKey="total" stroke="#4CB5F9" strokeWidth={2.5} fill="url(#salesGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
