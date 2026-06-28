"use client";
import React from 'react';
import {
  Menu, Bell, ChevronRight, Settings,
  User, BookOpen, Palette, Globe,
  Info, Home, Layers, HelpCircle
} from 'lucide-react';
 
export default function ConfiguracionScreen() {
  const opcionesConfig = [
    {
      id: 1,
      titulo: 'Perfil',
      descripcion: 'Edita tu información personal',
      colorIcono: 'text-blue-500 bg-blue-50',
      icono: <User size={20} />,
    },
    {
      id: 2,
      titulo: 'Preferencias de estudio',
      descripcion: 'Ajusta tus preferencias de aprendizaje',
      colorIcono: 'text-purple-500 bg-purple-50',
      icono: <BookOpen size={20} />,
    },
    {
      id: 3,
      titulo: 'Tema',
      descripcion: 'Elige entre tema claro u oscuro',
      colorIcono: 'text-amber-500 bg-amber-50',
      icono: <Palette size={20} />,
    },
    {
      id: 4,
      titulo: 'Idioma',
      descripcion: 'Selecciona tu idioma',
      colorIcono: 'text-emerald-500 bg-emerald-50',
      icono: <Globe size={20} />,
    },
    {
      id: 5,
      titulo: 'Acerca de',
      descripcion: 'Información de la aplicación',
      colorIcono: 'text-cyan-500 bg-cyan-50',
      icono: <Info size={20} />,
    },
  ];
 
  return (
    <div className="min-h-screen bg-[#E9F1FA] text-[#1E293B] font-sans pb-24 select-none relative">
      
      {/* 1. NAVBAR */}
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
      <main className="px-6 mt-2 space-y-6">
        
        {/* ICONO DE CONFIGURACIÓN */}
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-700 shadow-sm">
          <Settings size={28} />
        </div>
 
        {/* TÍTULO Y SUBTÍTULO */}
        <section>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Configuración
          </h2>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Personaliza tu experiencia de estudio
          </p>
        </section>
 
        {/* LISTA DE OPCIONES BLANCA */}
        <section className="bg-white rounded-[2.5rem] p-3 shadow-sm overflow-hidden">
          {opcionesConfig.map((opcion, index) => (
            <div
              key={opcion.id}
              className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/80 transition ${
                index !== opcionesConfig.length - 1 ? 'border-b border-slate-100/70' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${opcion.colorIcono}`}>
                  {opcion.icono}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-snug">{opcion.titulo}</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{opcion.descripcion}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 shrink-0" />
            </div>
          ))}
        </section>
 
        {/* CARD INFERIOR: MOTIVACIONAL MAPACHE */}
        <section className="bg-[#EDF5FF] border border-blue-100 rounded-[2.5rem] p-6 relative shadow-sm overflow-hidden flex items-center min-h-[140px]">
          
          {/* Pequeña estrella decorativa difuminada */}
          <span className="absolute top-4 left-4 text-slate-300/40 text-2xl">★</span>
 
          <div className="max-w-[55%] flex flex-col items-center text-center mx-auto z-10">
            <p className="font-extrabold text-slate-700 text-xs leading-normal">
              Raccoon te acompaña en cada paso de tu aprendizaje.
            </p>
            <span className="text-blue-500 text-xs mt-2">💙</span>
          </div>
 
          {/* Contenedor del Mapache Ilustrado */}
          <div className="absolute bottom-0 right-4 w-28 h-28 flex items-end justify-center select-none pointer-events-none">
            {/* Espacio listo para cuando uses la imagen real */}
            <span className="text-6xl mb-2 filter drop-shadow-sm">🦝📚</span>
          </div>
 
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