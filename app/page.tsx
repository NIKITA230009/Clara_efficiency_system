"use client";

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLaunchParams } from "@telegram-apps/sdk-react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from 'date-fns/locale/ru';
import TaskForm from "./components/TaskForm";
import PenaltyForm from "./components/PenaltyForm";
import TaskList from "./components/TaskList";
import EmployeeTable from './components/EmployeeTable';
import { getUserRole } from './lib/firebase';

registerLocale('ru', ru);

const TaskBoardClient = dynamic(() => Promise.resolve(TaskBoard), { ssr: false });

function TaskBoard() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("EMPLOYEE");
  const [isLoading, setIsLoading] = useState(true);
  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long', // 'long' выведет "января", 'numeric' выведет "01"


  });

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Добавляем переменную для вывода отладки на экран
  const [debugData, setDebugData] = useState<string>("Жду данные...");

  const lp = useLaunchParams();

  useEffect(() => {
    const initApp = async () => {
      try {
        // --- БЛОК ПОИСКА ID (ИСПРАВЛЕННЫЙ) ---

        // 1. Пробуем взять из SDK (твой способ)
        let foundId = (lp as any)?.initData?.user?.id;

        // 2. Если SDK вернул пустоту, лезем напрямую в Telegram (страховка)
        if (!foundId && typeof window !== 'undefined') {
          const tg = (window as any).Telegram?.WebApp;
          foundId = tg?.initDataUnsafe?.user?.id;
        }

        // Превращаем в строку
        const userId = foundId?.toString();

        // Показываем на экране, что мы нашли (для тебя)
        setDebugData(`Найден ID: ${userId || 'НЕТ'}\nИсточник LP: ${!!lp}\nИсточник Window: ${!!((window as any).Telegram?.WebApp)}`);

        // --- ЛОГИКА РОЛЕЙ ---
        if (userId) {
          console.log("ID найден, запрашиваем роль...", userId);
          const role = await getUserRole(userId);
          setUserRole(role);
        }

        // --- ЛОГИКА ГРУППЫ (оставляем как было) ---
        const startParam = lp?.startParam;
        if (startParam) {
          let base64 = String(startParam).replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) base64 += '=';
          setGroupId(atob(base64));
        }

      } catch (e: any) {
        console.error("Ошибка:", e);
        setDebugData(`Ошибка: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    // Запускаем не сразу, а даем 100мс, чтобы Telegram точно подгрузился
    setTimeout(initApp, 100);

  }, [lp]); // Перезапустится, если lp обновится

  if (isLoading) return <div className="p-8">Загрузка...</div>;

  const formattedDateString = selectedDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });



  return (
    <div className="min-h-screen bg-gray-50 font-sans text-black">
      <header className="bg-white border-b p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Clara Efficiency</h1>

          {/* КАЛЕНДАРЬ - ТЕПЕРЬ В ШАПКЕ ДЛЯ ВСЕХ
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-gray-500">Задачи на:</span>
          </div> */}

          {/* БЛОК ОТЛАДКИ - ТЕПЕРЬ ТЫ УВИДИШЬ ВСЁ НА ЭКРАНЕ */}
          <pre className="text-[10px] bg-gray-100 p-1 mt-1 rounded text-red-600 overflow-x-auto max-w-[200px]">
            {debugData}
          </pre>

          <p className="text-xs text-gray-500 mt-1">Группа: {groupId || "Личное"}</p>
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${userRole === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
            {userRole}
          </span>
        </div>
      </header>

      <main className="p-6 flex flex-col gap-6">
        {(userRole === 'ADMIN' || userRole === 'MANAGER') ? (
          <>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="text-sm font-semibold mb-3">Новая задача</h2>
              <TaskForm />
            </div>

            {/* НОВЫЙ БЛОК: Штрафы/Замечания */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
              <h2 className="text-sm font-semibold mb-3 text-red-600">Система замечаний</h2>
              <PenaltyForm />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="text-sm font-semibold mb-3">Управление сотрудниками</h2>
              <EmployeeTable />
            </div>
          </>
        ) :
          (
            <>
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h2 className="text-sm font-semibold mb-3">Текущие задачи на</h2>

                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => setSelectedDate(date || new Date())}
                  locale="ru"
                  dateFormat="d MMMM"
                  customInput={
                    <button className="text-xs font-bold text-blue-600 underline decoration-dotted italic">
                      {formattedDateString}
                    </button>} />

                <TaskList userRole={userRole} selectedDate={selectedDate} />
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h2 className="text-sm font-semibold mb-3">Список замечаний</h2>
                <EmployeeTable />
              </div>
            </>
          )}
        {/* 
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h2 className="text-sm font-semibold mb-3">Список задач</h2>
          <TaskList groupId={''}/>
        </div> */}


      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <TaskBoardClient />
    </Suspense>
  );
}