"use client";
 
import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Home, Layers, HelpCircle, User } from 'lucide-react';
 
const languagesData = [
  {
    code: 'es',
    name: 'Español',
    subtitle: 'Idioma actual',
    flag: '/flags/spain.png', // <-- Ruta de la imagen en tu carpeta public
  },
  {
    code: 'en',
    name: 'English',
    subtitle: 'Inglés',
    flag: '/flags/uk.png',
  },
  {
    code: 'pt',
    name: 'Português',
    subtitle: 'Português',
    flag: '/flags/portugal.png',
  },
  {
    code: 'fr',
    name: 'Français',
    subtitle: 'Francés',
    flag: '/flags/france.png',
  },
  {
    code: 'de',
    name: 'Deutsch',
    subtitle: 'Alemán',
    flag: '/flags/germany.png',
  },
];
 
export default function LanguageSelector() {
  const [activeLang, setActiveLang] = useState('es');
 
  return (
    <div className="min-h-screen bg-[#EAF3FE] text-[#0A1A2F] font-sans flex flex-col antialiased pb-24 relative">
      
      {/* Header */}
      <header className="flex items-center p-6 pt-12 bg-transparent">
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50 transition shrink-0">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 text-center mr-10">
          <h1 className="text-xl font-bold text-[#0050CC]">Idioma</h1>
          <p className="text-sm text-[#7487A1]">Selecciona tu idioma</p>
        </div>
      </header>
 
      {/* Main Content */}
      <main className="flex-1 p-6 space-y-4">
        {languagesData.map((lang) => {
          const esActivo = activeLang === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setActiveLang(lang.code)}
              className={`w-full flex items-center p-4 rounded-3xl border transition-all duration-150 ${
                esActivo
                  ? 'bg-white border-[#DCE7F5] shadow-[0_4px_12px_rgba(0,0,0,0.05)]'
                  : 'bg-white/70 border-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-white'
              }`}
            >
              {/* Contenedor de la Imagen de la Bandera */}
              <div className="h-10 w-14 relative flex-shrink-0 mr-4 rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                <Image
                  src={lang.flag}
                  alt={`Bandera de ${lang.name}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              
              <div className="flex-1 text-left">
                <p className="text-base font-semibold text-[#0A1A2F]">{lang.name}</p>
                <p className={`text-xs ${esActivo ? 'text-[#0050CC] font-medium' : 'text-[#7487A1]'}`}>
                  {lang.subtitle}
                </p>
              </div>
 
              {/* Selector circular */}
              <div className="ml-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  esActivo ? 'border-[#0050CC]' : 'border-[#D8DEE9]'
                }`}>
                  {esActivo && <div className="w-3 h-3 rounded-full bg-[#0050CC]" />}
                </div>
              </div>
            </button>
          );
        })}
 
        {/* Sección del botón de acción, slogan y mascota */}
        <div className="pt-6 pb-20 relative">
          <button className="w-full bg-[#0050CC] text-white font-bold text-base py-4 rounded-full shadow-[0_4px_14px_rgba(0,80,204,0.3)] hover:bg-[#0046B3] transition-colors z-20 relative">
            Guardar cambios
          </button>
 
          {/* Slogan Bubble */}
          <div className="absolute left-0 top-[110px] bg-white rounded-3xl rounded-tr-none px-6 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-w-[220px] z-10">
            <p className="text-[#0050CC] font-semibold text-xs leading-tight text-center">
              El conocimiento no tiene fronteras.
              <span className="block mt-1">💙</span>
            </p>
          </div>
 
          {/* Imagen de la Mascota Mapache */}
          <div className="absolute right-0 top-[80px] w-[140px] h-[140px] z-10 select-none pointer-events-none">
            <Image
              src="/raccoon.png" // <-- Tu imagen del mapache en public/
              alt="Mascota Mapache"
              width={140}
              height={140}
              priority
            />
          </div>
        </div>
      </main>
 
      {/* Footer Navigation (Tab Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDF2F7] rounded-t-[2rem] px-6 py-2 flex justify-around items-center shadow-xl z-50 max-w-md mx-auto">
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