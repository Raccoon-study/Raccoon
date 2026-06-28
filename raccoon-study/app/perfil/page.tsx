"use client";
import React from 'react';
import {
  ChevronLeft, Edit2, Camera, Calendar,
  Target, Flame, User, Mail, Sparkles,
  Globe, Clock, ChevronRight, Home,
  Layers, HelpCircle
} from 'lucide-react';
 
export default function PerfilScreen() {
  const datosUsuario = [
    { id: 1, etiqueta: 'Nombre completo', valor: 'Ana Martínez', icono: <User size={18} />, color: 'text-blue-500 bg-blue-50' },
    { id: 2, etiqueta: 'Correo electrónico', valor: 'ana.martinez@email.com', icono: <Mail size={18} />, color: 'text-blue-500 bg-blue-50' },
    { id: 3, etiqueta: 'Nombre de usuario', valor: 'ana_study', icono: <Sparkles size={18} />, color: 'text-blue-500 bg-blue-50' },
    { id: 4, etiqueta: 'Idioma', valor: 'Español', icono: <Globe size={18} />, color: 'text-blue-500 bg-blue-50' },
    { id: 5, etiqueta: 'Zona horaria', valor: '(GMT-5) Bogotá, Colombia', icono: <Clock size={18} />, color: 'text-blue-500 bg-blue-50' },
  ];
 
  return (
    <div className="min-h-screen bg-[#E9F1FA] text-[#1E293B] font-sans pb-24 select-none relative">
      
      {/* 1. HEADER (Perfil + Editar) */}
      <header className="flex items-center justify-between px-6 py-4 bg-transparent">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm hover:bg-slate-50 transition">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Perfil</h1>
            <p className="text-[11px] text-slate-400 font-medium">Edita tu información personal</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-white text-blue-600 text-xs font-bold rounded-xl shadow-sm border border-blue-50 hover:bg-blue-50/50 transition">
          <Edit2 size={13} />
          Editar
        </button>
      </header>
 
      {/* CONTENIDO PRINCIPAL */}
      <main className="px-6 mt-2 space-y-6">
        
        {/* CARD PRINCIPAL: FOTO, NOMBRE Y ESTADÍSTICAS */}
        <section className="bg-white rounded-[2.5rem] p-6 shadow-sm flex flex-col items-center">
          {/* Avatar con botón de cámara */}
          <div className="relative w-24 h-24 mb-3">
            <div className="w-full h-full bg-slate-100 rounded-full border-4 border-white shadow-inner flex items-center justify-center text-4xl overflow-hidden">
              🦝
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white hover:bg-blue-700 transition">
              <Camera size={12} />
            </button>
          </div>
 
          {/* Nombre, Correo y Rol */}
          <h2 className="text-xl font-extrabold text-slate-900">Ana Martínez</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">ana.martinez@email.com</p>
          
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold">
            <Sparkles size={12} className="fill-blue-600" />
            Estudiante
          </div>
 
          {/* Divisor */}
          <div className="w-full h-[1px] bg-slate-100 my-6"></div>
 
          {/* Métricas de progreso */}
          <div className="grid grid-cols-3 w-full text-center divide-x divide-slate-100">
            <div className="flex flex-col items-center px-1">
              <Calendar size={18} className="text-blue-500 mb-1" />
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Miembro desde</span>
              <span className="text-xs font-extrabold text-slate-800 mt-1">15 mar 2024</span>
            </div>
            <div className="flex flex-col items-center px-1">
              <Target size={18} className="text-blue-500 mb-1" />
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Objetivo actual</span>
              <span className="text-xs font-extrabold text-slate-800 mt-1 leading-tight">Aprender más</span>
            </div>
            <div className="flex flex-col items-center px-1">
              <Flame size={18} className="text-orange-500 fill-orange-500 mb-1" />
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Racha actual</span>
              <span className="text-xs font-extrabold text-slate-800 mt-1">7 días</span>
            </div>
          </div>
        </section>
 
        {/* SECCIÓN DE CAMPOS DE INFORMACIÓN */}
        <section className="bg-white rounded-[2.5rem] p-2 shadow-sm overflow-hidden">
          {datosUsuario.map((dato, index) => (
            <div
              key={dato.id}
              className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition ${
                index !== datosUsuario.length - 1 ? 'border-b border-slate-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dato.color}`}>
                  {dato.icono}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">{dato.etiqueta}</span>
                  <span className="text-sm font-bold text-slate-800">{dato.valor}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          ))}
        </section>
 
        {/* TARJETA DE MOTIVACIÓN INFERIOR */}
        <section className="bg-[#EBF5FF] border border-blue-100 rounded-[2.5rem] p-5 flex items-center gap-4 shadow-sm">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shrink-0 shadow-sm">
            🦝
          </div>
          <div>
            <h3 className="font-extrabold text-[#1D4ED8] text-base mb-1">¡Sigue así, Ana!</h3>
            <p className="text-[11px] text-slate-500 font-medium leading-normal">
              La constancia de hoy es el éxito de mañana. 💙
            </p>
          </div>
        </section>
 
      </main>
 
      {/* BARRA DE NAVEGACIÓN FIJA INFERIOR (TAB BAR) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-2 flex justify-around items-center rounded-t-[2rem] shadow-xl z-50 max-w-md mx-auto">
        <button className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-blue-600 transition">
          <Home size={20} />
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
        <button className="flex flex-col items-center gap-1 p-2 text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl transition">
          <User size={20} className="fill-blue-100" />
          <span className="text-[10px] font-bold">Perfil</span>
        </button>
      </nav>
 
    </div>
  );
}