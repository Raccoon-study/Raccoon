"use client";
import React from 'react';
import {
  ArrowLeft, Trophy, RefreshCw, CreditCard,
  Trash2, ChevronRight, Home, Layers,
  HelpCircle, User
} from 'lucide-react';
 
export default function SuscripcionScreen() {
  return (
    <div className="min-h-screen bg-white text-[#1E293B] font-sans pb-24 select-none relative">
      
      {/* 1. HEADER (Flecha atrás + Título) */}
      <header className="flex items-center gap-4 px-6 py-5 border-b border-slate-100">
        <button className="text-slate-700 p-1 hover:bg-slate-50 rounded-lg transition">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Mi suscripción</h1>
      </header>
 
      {/* CONTENIDO PRINCIPAL */}
      <main className="px-6 mt-6 space-y-8">
        
        {/* CARD SUPERIOR: PREMIUM ANUAL */}
        <section className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F5F3FF] rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
              <Trophy size={22} className="fill-purple-50" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">Premium Anual</h2>
              <p className="text-xs text-slate-500 mt-0.5">Vence el 25 may 2025</p>
              <p className="text-[10px] text-slate-400 italic mt-0.5 font-medium">Renovación automática activa</p>
            </div>
          </div>
          <span className="bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-100">
            Activa
          </span>
        </section>
 
        {/* SECCIÓN DETALLES */}
        <section>
          <h3 className="text-xs font-bold text-[#0284C7] tracking-wider uppercase mb-4">
            DETALLES
          </h3>
          <div className="space-y-4 font-medium text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Plan</span>
              <span className="text-slate-700 font-semibold">Premium Anual</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Precio</span>
              <span className="text-slate-700 font-semibold">$ 89.900 /año</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Próximo cobro</span>
              <span className="text-slate-700 font-semibold">25 may 2025</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Método de pago</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-semibold">•••• 4242</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold border border-blue-200 px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Visa
                </span>
              </div>
            </div>
          </div>
        </section>
 
        {/* SECCIÓN ACCIONES */}
        <section>
          <h3 className="text-xs font-bold text-[#0284C7] tracking-wider uppercase mb-2">
            ACCIONES
          </h3>
          <div className="divide-y divide-slate-100">
            {/* Cambiar de plan */}
            <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-slate-50/50 transition">
              <div className="flex items-center gap-3 text-slate-600">
                <RefreshCw size={18} />
                <span className="text-sm font-semibold text-slate-700">Cambiar de plan</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
 
            {/* Actualizar método de pago */}
            <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-slate-50/50 transition">
              <div className="flex items-center gap-3 text-slate-600">
                <CreditCard size={18} />
                <span className="text-sm font-semibold text-slate-700">Actualizar método de pago</span>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
 
            {/* Cancelar suscripción */}
            <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-red-50/30 transition">
              <div className="flex items-center gap-3 text-red-500">
                <Trash2 size={18} />
                <span className="text-sm font-semibold">Cancelar suscripción</span>
              </div>
            </div>
          </div>
        </section>
 
        {/* TEXTO DE ADVERTENCIA INFERIOR */}
        <section className="pt-4 text-center">
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[80%] mx-auto">
            Si cancelas, seguirás teniendo acceso hasta el{' '}
            <span className="text-slate-700 font-bold">25 may 2025</span>.
          </p>
        </section>
 
      </main>
 
      {/* BARRA DE NAVEGACIÓN FIJA INFERIOR (TAB BAR) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-2 flex justify-around items-center rounded-t-[2rem] shadow-xl z-50 max-w-md mx-auto">
        <button className="flex flex-col items-center gap-1 p-2 text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl transition">
          <Home size={20} className="fill-blue-100" />
          <span className="text-[10px] font-bold">Inicio</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-blue-600 transition">
          <Layers size={20} />
          <span className="text-[10px] font-bold">Métodos</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-blue-600 transition">
          <HelpCircle size={20} />
          <span className="text-[10px] font-bold">Quiz</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-blue-600 transition">
          <User size={20} />
          <span className="text-[10px] font-bold">Perfil</span>
        </button>
      </nav>
 
    </div>
  );
}