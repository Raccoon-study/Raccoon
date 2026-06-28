"use client"; // <-- ¡Agrega esto obligatoriamente
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
 
export default function RaccoonStudyCheckout() {
  // Estado para manejar el método de pago seleccionado
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(1);
 
  const metodosPago = [
    {
      id: 1,
      titulo: 'Tarjeta de crédito o débito',
      tieneTarjetas: true,
    },
    {
      id: 2,
      titulo: 'Nequi',
      tieneTarjetas: false,
    },
    {
      id: 3,
      titulo: 'Daviplata',
      tieneTarjetas: false,
    },
    {
      id: 4,
      titulo: 'PayPal',
      tieneTarjetas: false,
    },
  ];
 
  return (
    <div className="min-h-screen bg-[#E9F1FA] text-[#1E293B] font-sans flex justify-center items-center p-4 select-none">
     
      {/* CONTENEDOR EMULANDO DISPOSITIVO MÓVIL */}
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 flex flex-col relative">
       
        {/* 1. NAVBAR / HEADER */}
        <header className="flex items-center justify-between px-6 py-5 bg-transparent relative">
          <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition absolute left-4">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
         
          <div className="w-full text-center">
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Pago seguro</h1>
            <p className="text-xs text-slate-400 mt-0.5">Completa tu compra</p>
          </div>
        </header>
 
        {/* CONTENIDO PRINCIPAL */}
        <main className="px-6 py-2 flex-1">
         
          {/* 2. RESUMEN DE TU PEDIDO */}
          <section className="mb-6">
            <h2 className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-4">
              Resumen de tu pedido
            </h2>
           
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-600 font-medium">Premium Anual</span>
              <span className="text-sm font-semibold text-slate-900">$ 9.00</span>
            </div>
           
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm text-slate-600 font-medium">7 días gratis</span>
              <span className="text-sm font-semibold text-slate-900">$ 0</span>
            </div>
 
            {/* Fila del Total */}
            <div className="flex justify-between items-baseline pt-4 border-t border-dashed border-slate-200">
              <span className="text-lg font-bold text-slate-900">Total</span>
              <div className="text-right">
                <span className="text-lg font-bold text-slate-900">$ 9.00 COP</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Luego $ 9.00 /año</span>
              </div>
            </div>
          </section>
 
          {/* 3. MÉTODO DE PAGO */}
          <section className="mb-6">
            <h2 className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-4">
              Método de pago
            </h2>
 
            <div className="space-y-3">
              {metodosPago.map((metodo) => {
                const esActivo = metodoSeleccionado === metodo.id;
                return (
                  <div
                    key={metodo.id}
                    onClick={() => setMetodoSeleccionado(metodo.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      esActivo
                        ? 'border-[#00769E] bg-white ring-1 ring-[#00769E]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Radio Button Customizado */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        esActivo ? 'border-[#00769E]' : 'border-slate-300'
                      }`}>
                        {esActivo && <div className="w-2.5 h-2.5 rounded-full bg-[#00769E]" />}
                      </div>
 
                      {/* Detalles del Método */}
                      <div className="flex flex-col">
                        <span className={`text-sm transition-colors ${
                          esActivo ? 'font-bold text-slate-900' : 'font-medium text-slate-600'
                        }`}>
                          {metodo.titulo}
                        </span>
                       
                        {/* Mini-iconos simulados para las tarjetas */}
                        {metodo.tieneTarjetas && (
                          <div className="flex gap-1 mt-1">
                            <span className="w-5 h-3.5 bg-[#1A1F71] rounded-sm block" />
                            <span className="w-5 h-3.5 bg-[#EA001B] rounded-sm block" />
                            <span className="w-5 h-3.5 bg-[#0070CD] rounded-sm block" />
                          </div>
                        )}
                      </div>
                    </div>
 
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                );
              })}
            </div>
          </section>
 
        </main>
 
        {/* 4. FOOTER CON BOTÓN DE ACCIÓN */}
        <footer className="p-6 bg-white border-t border-slate-50 text-center">
          <button className="w-full bg-[#00769E] hover:bg-[#006284] text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-cyan-900/10 transition duration-200 text-base">
            Pagar ahora
          </button>
         
          <p className="text-[10px] text-slate-400 mt-4.5 leading-relaxed">
            Al continuar aceptas nuestros <br />
            <a href="#terminos" className="underline hover:text-slate-600">Términos y Condiciones</a>
          </p>
        </footer>
 
      </div>
    </div>
  );
}