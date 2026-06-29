"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabase.js";

import {
  ChevronLeft,
  CreditCard,
  Edit2,
  Camera,
  Calendar,
  Target,
  Flame,
  User,
  Mail,
  Sparkles,
  Globe,
  Clock,
  ChevronRight,
  Home,
  Grid,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

export default function PerfilScreen() {

  const [usuario, setUsuario] = useState({
    nombre: "",
    correo: "",
    username: "",
  });

  const [idioma, setIdioma] = useState("Español");
  const [userId, setUserId] = useState("");
  const [showIdiomaModal, setShowIdiomaModal] = useState(false);

  // ✅ CARGAR USUARIO + IDIOMA
  useEffect(() => {
    const cargarDatos = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);

        setUsuario({
          nombre:
            user.user_metadata?.nombre ||
            user.user_metadata?.full_name ||
            "Usuario",
          correo: user.email || "",
          username:
            user.user_metadata?.username ||
            user.email?.split("@")[0] ||
            "",
        });

        // ✅ Cargar idioma desde DB
        const { data } = await supabase
          .from("user_settings")
          .select("idioma")
          .eq("user_id", user.id)
          .single();

        if (data?.idioma) {
          setIdioma(data.idioma);
        }
      }
    };

    cargarDatos();
  }, []);

  // ✅ CAMBIAR IDIOMA
  const handleChangeIdioma = async (nuevoIdioma: string) => {
    setIdioma(nuevoIdioma);

    try {
      await fetch("/api/idioma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idioma: nuevoIdioma,
          user_id: userId,
        }),
      });
    } catch (err) {
      console.error(err);
    }

    setShowIdiomaModal(false);
  };

  const datosUsuario = [
    {
      id: 1,
      etiqueta: "Nombre completo",
      valor: usuario.nombre,
      icono: <User size={18} />,
      color: "text-blue-500 bg-blue-50",
      link: "#",
    },
    {
      id: 2,
      etiqueta: "Correo electrónico",
      valor: usuario.correo,
      icono: <Mail size={18} />,
      color: "text-blue-500 bg-blue-50",
      link: "#",
    },
    {
      id: 3,
      etiqueta: "Usuario",
      valor: usuario.username,
      icono: <Sparkles size={18} />,
      color: "text-purple-500 bg-purple-50",
      link: "#",
    },
    {
      id: 4,
      etiqueta: "Idioma",
      valor: idioma,
      icono: <Globe size={18} />,
      color: "text-green-500 bg-green-50",
      action: "idioma",
    },
    {
      id: 5,
      etiqueta: "Zona horaria",
      valor: "(GMT-5) Bogotá",
      icono: <Clock size={18} />,
      color: "text-orange-500 bg-orange-50",
      link: "#",
    },
    {
      id: 6,
      etiqueta: "Suscripción",
      valor: "Plan Gratuito",
      icono: <CreditCard size={18} />,
      color: "text-indigo-500 bg-indigo-50",
      link: "/suscripcion",
    },
  ];

  return (
    <div className="min-h-screen bg-[#E9F1FA] pb-24">

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/Dashboard" className="w-10 h-10 bg-white rounded-xl shadow flex items-center justify-center">
          <ChevronLeft size={20} />
        </Link>

        <div className="text-center">
          <h1 className="font-bold text-xl">Perfil</h1>
          <p className="text-xs text-gray-500">Edita tu información</p>
        </div>

        <button className="bg-white rounded-xl px-4 py-2 shadow flex gap-2 items-center text-blue-600">
          <Edit2 size={14} />
          Editar
        </button>
      </header>

      <main className="px-6 space-y-6">

        {/* PERFIL */}
        <section className="bg-white rounded-3xl shadow p-6 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl">
              🦝
            </div>
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full">
              <Camera size={14} />
            </button>
          </div>

          <h2 className="font-bold text-xl">{usuario.nombre}</h2>
          <p className="text-gray-500">{usuario.correo}</p>
        </section>

        {/* LISTA */}
        <section className="bg-white rounded-3xl shadow overflow-hidden">

          {datosUsuario.map((dato, index) => {

            if (dato.action === "idioma") {
              return (
                <div
                  key={dato.id}
                  onClick={() => setShowIdiomaModal(true)}
                  className={`flex justify-between items-center p-5 cursor-pointer hover:bg-slate-50 ${
                    index !== datosUsuario.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dato.color}`}>
                      {dato.icono}
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">{dato.etiqueta}</p>
                      <p className="font-semibold">{dato.valor}</p>
                    </div>

                  </div>

                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              );
            }

            return (
              <Link
                key={dato.id}
                href={dato.link || "#"}
                className={`flex justify-between items-center p-5 hover:bg-slate-50 ${
                  index !== datosUsuario.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex items-center gap-4">

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dato.color}`}>
                    {dato.icono}
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">{dato.etiqueta}</p>
                    <p className="font-semibold">{dato.valor}</p>
                  </div>

                </div>

                <ChevronRight size={18} className="text-gray-300" />
              </Link>
            );
          })}

        </section>

      </main>

      {/* ✅ MODAL */}
      {showIdiomaModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-end z-50">

          <div className="w-full max-w-md bg-white rounded-t-2xl p-6">

            <h2 className="text-lg font-bold mb-4">Seleccionar idioma</h2>

            <div className="space-y-3">

              <button
                onClick={() => handleChangeIdioma("Español")}
                className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-slate-50"
              >
                Español
                {idioma === "Español" && <CheckCircle2 className="text-blue-500" />}
              </button>

              <button
                onClick={() => handleChangeIdioma("English")}
                className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-slate-50"
              >
                English
                {idioma === "English" && <CheckCircle2 className="text-blue-500" />}
              </button>

            </div>

            <button
              onClick={() => setShowIdiomaModal(false)}
              className="mt-6 w-full bg-slate-100 py-2 rounded-xl"
            >
              Cancelar
            </button>

          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[35px] shadow-lg py-3 px-6 flex justify-around">

        <Link href="/Dashboard" className="flex flex-col items-center text-gray-500">
          <Home size={20} />
          <span className="text-xs">Inicio</span>
        </Link>

        <Link href="/metodos" className="flex flex-col items-center text-gray-500">
          <Grid size={20} />
          <span className="text-xs">Métodos</span>
        </Link>

        <Link href="/quizzes" className="flex flex-col items-center text-gray-500">
          <HelpCircle size={20} />
          <span className="text-xs">Quiz</span>
        </Link>

        <Link href="/perfil" className="flex flex-col items-center text-blue-600">
          <User size={20} />
          <span className="text-xs font-semibold">Perfil</span>
        </Link>

      </nav>

    </div>
  );
}