"use client";
import React from 'react';
import {
  ArrowLeft, Check, ShieldCheck, Home,
  Layers, HelpCircle, User
} from 'lucide-react';
 
export default function SuscripcionExitosaScreen() {
  return (
    <div className="min-h-screen bg-white text-[#1E293B] font-sans pb-24 select-none relative flex flex-col justify-between">
      
      {/* SECCIÓN SUPERIOR: HEADER */}
      <div>
        <header className="flex items-center px-6 py-5 bg-transparent">
          <button className="text-slate-700 p-1 hover:bg-slate-50 rounded-lg transition">
            <ArrowLeft size={22} />
          </button>
        </header>
 
        {/* CONTENIDO PRINCIPAL CENTRADO */}
        <main className="px-6 mt-4 flex flex-col items-center text-center">
          
          {/* CÍRCULO DE ÉXITO CON ELEMENTOS FLOTANTES DE COLORES */}
          <div className="relative mb-8 mt-4">
            {/* Círculo verde principal con sombra */}
            <div className="w-24 h-24 bg-[#22C55E] rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100 relative z-10">
              <Check size={48} strokeWidth={3} />
            </div>
            
            {/* Círculos decorativos decorativos flotando (Simulando confeti de la imagen) */}
            <div className="absolute top-0 -right-6 w-3 h-3 bg-[#BFDBFE] rounded-full opacity-70"></div>
            <div className="absolute bottom-4 -left-6 w-2,5 h-2,5 bg-[#FDE047] rounded-full opacity-70"></div>
            <div className="absolute -bottom-2 -right-4 w-4 h-4 bg-[#E9D5FF] rounded-full opacity-60"></div>
          </div>
 
          {/* MENSAJE DE ÉXITO */}
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            ¡Suscripción exitosa!
          </h2>
          <p className="text-sm text-slate-500 font-medium flex items-center justify-center gap-1.5 mb-8">
            Ya eres parte de Raccoon Premium 👑
          </p>
 
          {/* TARJETA DEL PLAN ADQUIRIDO */}
          <section className="w-full max-w-sm bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100 flex items-center gap-4 mb-6">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-50 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800 text-sm">Premium Anual</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Vence el 25 may 2025</p>
            </div>
          </section>
 
          {/* ENLACE SECUNDARIO */}
          <button className="text-blue-600 hover:text-blue-700 text-xs font-bold tracking-wide transition">
            Ver mis beneficios
          </button>
 
        </main>
      </div>
 
      {/* SECCIÓN INFERIOR: BOTÓN Y MENÚ */}
      <div className="w-full px-6 space-y-8 mb-4">
        
        {/* BOTÓN PRINCIPAL AZUL */}
        <div className="max-w-sm mx-auto">
          <button className="w-full bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold py-4 px-6 rounded-2xl text-sm shadow-md transition duration-200">
            Comenzar a disfrutar
          </button>
        </div>
 
        {/* BARRA DE NAVEGACIÓN FIJA INFERIOR (TAB BAR) */}
        <nav className="bg-white border-t border-slate-100 px-6 py-2 flex justify-around items-center rounded-t-[2rem] shadow-xl max-w-md mx-auto">
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
 
    </div>
  );
}