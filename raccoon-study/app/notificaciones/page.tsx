import React from 'react';
import {
  Menu, Bell, ChevronRight, Calendar,
  Inbox, Trophy, Lightbulb, Clock, VolumeX
} from 'lucide-react';
 
export default function NotificacionesScreen() {
  return (
    <div className="min-h-screen bg-[#E9F1FA] text-[#1E293B] font-sans pb-10 select-none">
      
      {/* 1. NAVBAR (Igual a la anterior) */}
      <header className="flex items-center justify-between px-6 py-4 bg-transparent">
        <button className="p-2 text-slate-700 hover:bg-white/50 rounded-xl transition">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-[#1D4ED8]">Raccoon Study</h1>
        <button className="p-2 text-slate-700 hover:bg-white/50 rounded-xl transition relative">
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>
 
      {/* CONTENIDO PRINCIPAL */}
      <main className="px-6 mt-2">
        
        {/* ICONO DE CAMPANA AZUL */}
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6">
          <Bell size={28} className="fill-blue-50" />
        </div>
 
        {/* TÍTULO Y SUBTÍTULO */}
        <section className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Notificaciones
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Gestiona cómo y cuándo quieres recibir alertas
          </p>
        </section>
 
        {/* CARD PRINCIPAL: ACTIVAR NOTIFICACIONES */}
        <section className="bg-white rounded-[2rem] p-6 flex items-center justify-between shadow-sm mb-10">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Activar notificaciones</h3>
            <p className="text-xs text-slate-400 font-medium">Recibe recordatorios y novedades</p>
          </div>
          {/* Switch iOS Style (On) */}
          <div className="w-14 h-7 bg-blue-600 rounded-full relative p-1 flex items-center justify-end">
            <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
          </div>
        </section>
 
        {/* SECCIÓN: TIPOS DE NOTIFICACIÓN */}
        <section className="mb-10">
          <h4 className="text-[11px] font-bold text-slate-400 tracking-widest mb-4 ml-1">
            TIPOS DE NOTIFICACIÓN
          </h4>
          <div className="bg-white rounded-[2rem] p-2 shadow-sm overflow-hidden">
            
            {/* ITEM 1: Recordatorios */}
            <div className="flex items-center justify-between p-4 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-500">
                  <Calendar size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Recordatorios de estudio</h5>
                  <p className="text-[10px] text-slate-400 leading-tight pr-4">Te notificamos para que no olvides estudiar</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-blue-500 rounded-full relative p-1 flex items-center justify-end shrink-0">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
 
            {/* ITEM 2: Nuevos contenidos */}
            <div className="flex items-center justify-between p-4 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                  <Inbox size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Nuevos contenidos</h5>
                  <p className="text-[10px] text-slate-400 leading-tight">Recibe alertas cuando haya nuevo contenido</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-blue-500 rounded-full relative p-1 flex items-center justify-end shrink-0">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
 
            {/* ITEM 3: Logros */}
            <div className="flex items-center justify-between p-4 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                  <Trophy size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Logros y recompensas</h5>
                  <p className="text-[10px] text-slate-400 leading-tight">Te avisamos cuando obtengas logros</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-blue-500 rounded-full relative p-1 flex items-center justify-end shrink-0">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
 
            {/* ITEM 4: Consejos (Switch Off) */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Consejos y tips</h5>
                  <p className="text-[10px] text-slate-400 leading-tight">Recibe consejos para mejorar tu estudio</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 flex items-center justify-start shrink-0">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </section>
 
        {/* SECCIÓN: PREFERENCIAS */}
        <section className="mb-6">
          <h4 className="text-[11px] font-bold text-slate-400 tracking-widest mb-4 ml-1">
            PREFERENCIAS
          </h4>
          <div className="bg-white rounded-[2rem] p-2 shadow-sm overflow-hidden">
            
            {/* Horario */}
            <div className="flex items-center justify-between p-4 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                  <Clock size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Horario de notificaciones</h5>
                  <p className="text-[10px] text-slate-400 leading-tight pr-8">Elige en qué horarios quieres recibir notificaciones</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-[10px] font-bold whitespace-nowrap">08:00 - 21:00</span>
                <ChevronRight size={14} />
              </div>
            </div>
 
            {/* Silenciar */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500">
                  <VolumeX size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-800">Silenciar notificaciones</h5>
                  <p className="text-[10px] text-slate-400 leading-tight pr-10">Pausa todas las notificaciones temporalmente</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-[10px] font-bold">No</span>
                <ChevronRight size={14} />
              </div>
            </div>
 
          </div>
        </section>
 
      </main>
    </div>
  );
}