"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Sparkles,
  ChevronRight,
  Home,
  Grid,
  HelpCircle,
  User,
} from "lucide-react";

export default function Quizzes() {
  const router = useRouter();

  const quizzes = [
    {
      titulo: "Biología Celular",
      preguntas: 20,
      progreso: 0,
    },
    {
      titulo: "Historia del Arte",
      preguntas: 15,
      progreso: 60,
    },
  ];

  return (
    <div className="min-h-screen bg-[#E9F1FA] pb-28">

      {/* HEADER */}

      <header className="flex items-center justify-between px-6 py-5">

        <button>
          <Menu size={22} />
        </button>

        <h1 className="font-bold text-blue-700 text-xl">
          Raccoon Study
        </h1>

        <Bell size={20} />

      </header>

      <main className="px-5">

        {/* HERO */}

        <div className="bg-white rounded-[30px] p-8 shadow">

          <h2 className="text-3xl font-bold text-center">
            Pon a prueba tus conocimientos
          </h2>

          <p className="text-center text-gray-500 mt-4 text-sm">
            Deja que la IA cree un cuestionario
            personalizado basado en tus apuntes
            y materiales.
          </p>

          <button
            onClick={() => router.push("/Tema")}
            className="mt-8 mx-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-lg"
          >
            <Sparkles size={18} />
            Generar nuevo quiz
          </button>

          <div className="mt-8 flex justify-center">

            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
              className="w-36"
            />

          </div>

        </div>

        {/* QUIZZES */}

        <div className="mt-8 flex justify-between items-center">

          <h3 className="font-bold text-xl">
            Quizzes listos para ti
          </h3>

          <Link
            href="/progreso"
            className="text-blue-600 text-sm"
          >
            Ver todos
          </Link>

        </div>

        <div className="space-y-4 mt-4">

          {quizzes.map((quiz, index) => (

            <div
              key={index}
              className="bg-white rounded-3xl shadow p-4 flex justify-between items-center"
            >

              <div className="flex gap-4">

                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">

                  🧠

                </div>

                <div>

                  <h4 className="font-semibold">

                    {quiz.titulo}

                  </h4>

                  <p className="text-gray-500 text-sm">

                    {quiz.preguntas} preguntas

                  </p>

                  <div className="w-44 bg-gray-200 rounded-full h-2 mt-2">

                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${quiz.progreso}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

              <div className="text-sm font-semibold text-gray-500">

                {quiz.progreso}%

              </div>

            </div>

          ))}

        </div>

        {/* HISTORIAL */}

        <h3 className="font-bold text-xl mt-10">
          Historial reciente
        </h3>

        <div className="grid grid-cols-2 gap-4 mt-4">

          <div className="bg-white rounded-3xl p-5 shadow text-center">

            <h2 className="text-4xl font-bold text-blue-700">

              90%

            </h2>

            <p className="mt-2 font-semibold">

              Física Cuántica

            </p>

            <span className="text-gray-400 text-sm">

              Ayer

            </span>

          </div>

          <div className="bg-white rounded-3xl p-5 shadow text-center">

            <h2 className="text-4xl font-bold text-blue-700">

              68%

            </h2>

            <p className="mt-2 font-semibold">

              Literatura S.X

            </p>

            <span className="text-gray-400 text-sm">

              Hace 2 días

            </span>

          </div>

        </div>

      </main>

      {/* NAVBAR */}

      <nav className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[35px] shadow-lg py-3 px-6 flex justify-around">

        <Link
          href="/Dashboard"
          className="flex flex-col items-center text-blue-600"
        >
          <Home size={20} />
          <span className="text-xs">Inicio</span>
        </Link>

        <Link
          href="/metodos"
          className="flex flex-col items-center text-gray-500"
        >
          <Grid size={20} />
          <span className="text-xs">Métodos</span>
        </Link>

        <Link
          href="/quizzes"
          className="flex flex-col items-center text-gray-500"
        >
          <HelpCircle size={20} />
          <span className="text-xs">Quiz</span>
        </Link>

        <Link
          href="/perfil"
          className="flex flex-col items-center text-gray-500"
        >
          <User size={20} />
          <span className="text-xs">Perfil</span>
        </Link>

      </nav>

    </div>
  );
}