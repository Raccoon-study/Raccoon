import React from 'react';
import {
  Menu, Bell, ChevronRight, HelpCircle,
  User, Mail, AlertTriangle, Info, MessageSquare
} from 'lucide-react';
 
export default function AyudaScreen() {
  const opcionesAyuda = [
    {
      id: 1,
      titulo: 'Preguntas frecuentes',
      descripcion: 'Encuentra respuestas a dudas comunes',
      colorIcono: 'text-blue-500 bg-blue-50',
      icono: <User size={20} />,
    },
    {
      id: 2,
      titulo: 'Contáctanos',
      descripcion: 'Envíanos tus dudas o sugerencias',
      colorIcono: 'text-emerald-500 bg-emerald-50',
      icono: <Mail size={20} />,
    },
    {
      id: 3,
      titulo: 'Reportar un problema',
      descripcion: 'Ayúdanos a mejorar la aplicación',
      colorIcono: 'text-amber-500 bg-amber-50',
      icono: <AlertTriangle size={20} />,
    },
    {
      id: 4,
      titulo: 'Acerca de Raccoon Study',
      descripcion: 'Versión 1.0.0 • Términos y privacidad',
      colorIcono: 'text-slate-500 bg-slate-50',
      icono: <Info size={20} />,
    },
  ];
 
  return (
    <div className="min-h-screen bg-[#E9F1FA] text-[#1E293B] font-sans pb-10 select-none">
      
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
      <main className="px-6 mt-2">
        
        {/* ICONO DE AYUDA AZUL */}
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6">
          <HelpCircle size={28} className="fill-blue-50" />
        </div>
 
        {/* TÍTULO Y SUBTÍTULO */}
        <section className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Ayuda
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium flex items-center gap-1">
            Estamos aquí para ayudarte <span className="text-blue-500">💙</span>
          </p>
        </section>
 
        {/* LISTA DE OPCIONES BLANCA */}
        <section className="bg-white rounded-[2.5rem] p-3 shadow-sm mb-8 overflow-hidden">
          {opcionesAyuda.map((opcion, index) => (
            <div
              key={opcion.id}
              className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/80 transition ${
                index !== opcionesAyuda.length - 1 ? 'border-b border-slate-100/70' : ''
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
 
        {/* CARD INFERIOR: ¿NO ENCUENTRAS LO QUE BUSCAS? */}
        <section className="bg-[#FDF4FF] border border-purple-100 rounded-[2.5rem] p-6 relative shadow-sm overflow-hidden flex flex-col justify-between min-h-[180px]">
          
          {/* Pequeño icono de mensaje flotante */}
          <div className="absolute top-4 right-4 w-9 h-9 bg-white rounded-xl flex items-center justify-center text-purple-500 shadow-sm">
            <MessageSquare size={18} className="fill-purple-50" />
          </div>
 
          <div className="max-w-[60%]">
            <h3 className="font-bold text-slate-900 text-base leading-tight mb-2">
              ¿No encuentras lo que buscas?
            </h3>
            <p className="text-[11px] text-slate-500 font-medium leading-normal">
              Nuestro equipo está listo para ayudarte.
            </p>
          </div>
 
          {/* Botón Contáctanos morado */}
          <button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold py-3 px-6 rounded-2xl w-fit shadow-md shadow-purple-200 transition mt-4">
            Contáctanos
          </button>
 
          {/* Contenedor del Mapache (Simulado para que pongas tu imagen) */}
          <div className="absolute bottom-0 right-2 w-32 h-32 flex items-end justify-center select-none pointer-events-none">
            {/* Cuando tengas la imagen del mapache en tu carpeta public/, puedes usar: */}
            {/* <img src="/raccoon-help.png" alt="Raccoon" className="object-contain max-h-full" /> */}
            <span className="text-6xl mb-2 filter drop-shadow-sm">🦝</span>
          </div>
 
        </section>
 
      </main>
    </div>
  );
}