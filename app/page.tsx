"use client";

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLaunchParams } from "@telegram-apps/sdk-react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import { getUserRole } from './lib/firebase';

const TaskBoardClient = dynamic(() => Promise.resolve(TaskBoard), { ssr: false });

function TaskBoard() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("EMPLOYEE");
  const [isLoading, setIsLoading] = useState(true);

  const lp = useLaunchParams();

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Получаем ID группы из startParam (как и раньше)
        const startParam = lp?.startParam;
        if (startParam) {
          let base64 = String(startParam).replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) base64 += '=';
          const decoded = atob(base64);
          setGroupId(decoded);
        }

        // 2. Получаем ID пользователя и его роль
        // Пытаемся взять ID из данных запуска Telegram
        const userId = (lp as any)?.initData?.user?.id?.toString();
        if (userId) {
          console.log("Ваш Telegram ID:", userId);
          const role = await getUserRole(userId);
          setUserRole(role);
        }
      } catch (e) {
        console.error("Ошибка инициализации:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, [lp]);

  if (isLoading) return <div className="p-8">Загрузка системы...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-black">
      {/* Шапка с ролью */}
      <header className="bg-white border-b p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Clara Efficiency</h1>
          <p className="text-xs text-gray-500">Группа: {groupId || "Личное"}</p>
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${userRole === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
            {userRole}
          </span>
        </div>
      </header>

      <main className="p-6 flex flex-col gap-6">
        {/* ФОРМА: Видна только Админу и Менеджеру */}
        {(userRole === 'ADMIN' || userRole === 'MANAGER') ? (
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <h2 className="text-sm font-semibold mb-3">Новая задача</h2>
            <TaskForm groupId={groupId || "default"} />
          </div>
        ) : (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
            ℹ️ Вы зашли как сотрудник. Вы можете просматривать задачи, но не добавлять их.
          </div>
        )}

        {/* СПИСОК: Виден всем */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <h2 className="text-sm font-semibold mb-3">Список задач</h2>
          <TaskList groupId={groupId || "default"} />
        </div>
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