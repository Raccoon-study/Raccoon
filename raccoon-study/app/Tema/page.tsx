"use client";
 
import React, { useState } from 'react';
import { ArrowLeft, Home, Layers, HelpCircle, User } from 'lucide-react';
 
export default function TemaScreen() {
  // Estado para controlar qué tema está seleccionado (1 = Claro, 2 = Oscuro)
  const [temaSeleccionado, setTemaSeleccionado] = useState(1);
 
  return (
    <div className="min-h-screen bg-[#E9F1FA] text-[#1E293B] font-sans pb-24 select-none relative">
      
      {/* 1. HEADER (Flecha + Título de sección + Avatar Mapache) */}
      <header className="flex items-center justify-between px-6 py-5 bg-transparent">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50 transition shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-[#1D4ED8] leading-tight">Tema</h1>
            <p className="text-[11px] text-slate-400 font-medium">Elige entre tema claro u oscuro</p>
          </div>
        </div>
        {/* Avatar del Mapache */}
        <div className="w-9 h-9 bg-slate-200 rounded-full overflow-hidden flex items-center justify-center border border-slate-100 shadow-sm text-xl">
          🦝
        </div>
      </header>
 
      {/* CONTENIDO PRINCIPAL */}
      <main className="px-6 mt-2 space-y-4">
        
        {/* OPCIÓN 1: TEMA CLARO */}
        <div
          onClick={() => setTemaSeleccionado(1)}
          className={`bg-white rounded-[2rem] p-5 cursor-pointer border-2 transition-all duration-200 ${
            temaSeleccionado === 1 ? 'border-[#0056C6]' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Claro</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Tema claro de la aplicación</p>
            </div>
            {/* Radio Button */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              temaSeleccionado === 1 ? 'border-[#0056C6]' : 'border-slate-300'
            }`}>
              {temaSeleccionado === 1 && <div className="w-2.5 h-2.5 rounded-full bg-[#0056C6]" />}
            </div>
          </div>
 
          {/* Mini maqueta del tema claro */}
          <div className="bg-[#F1F5F9] rounded-2xl p-4 space-y-3">
            <div className="w-24 h-3 bg-slate-200 rounded-md" />
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white h-8 rounded-lg border border-slate-100" />
              <div className="bg-white h-8 rounded-lg border border-slate-100" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#0056C6] rounded-full" />
              <div className="flex-1 h-6 bg-[#0056C6] rounded-full" />
            </div>
          </div>
        </div>
 
        {/* OPCIÓN 2: TEMA OSCURO */}
        <div
          onClick={() => setTemaSeleccionado(2)}
          className={`bg-[#1E293B] rounded-[2rem] p-5 cursor-pointer border-2 transition-all duration-200 ${
            temaSeleccionado === 2 ? 'border-[#0056C6]' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-white">Oscuro</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Tema oscuro de la aplicación</p>
            </div>
            {/* Radio Button */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              temaSeleccionado === 2 ? 'border-[#0056C6]' : 'border-slate-600'
            }`}>
              {temaSeleccionado === 2 && <div className="w-2.5 h-2.5 rounded-full bg-[#0056C6]" />}
            </div>
          </div>
 
          {/* Mini maqueta del tema oscuro */}
          <div className="bg-[#334155] rounded-2xl p-4 space-y-3">
            <div className="w-24 h-3 bg-[#475569] rounded-md" />
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#1E293B] h-8 rounded-lg" />
              <div className="bg-[#1E293B] h-8 rounded-lg" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#475569] rounded-full" />
              <div className="flex-1 h-6 bg-[#93C5FD] rounded-full" />
            </div>
          </div>
        </div>
 
        {/* BOTÓN: GUARDAR CAMBIOS */}
        <div className="pt-4">
          <button className="w-full bg-[#0056C6] hover:bg-[#0044A5] text-white font-bold py-4 px-6 rounded-2xl text-sm shadow-md transition duration-200">
            Guardar cambios
          </button>
        </div>
 
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