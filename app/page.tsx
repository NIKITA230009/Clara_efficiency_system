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
import AddEmployeeForm from './components/AddEmployee';
import MyPenalties from './components/MyPenalties'; // ✅ ИМПОРТИРУЕМ КОМПОНЕНТ

registerLocale('ru', ru);

const TaskBoardClient = dynamic(() => Promise.resolve(TaskBoard), { ssr: false });

// Переключатель ролей для тестирования
function RoleSwitcher({ currentRole, onRoleChange }: { 
  currentRole: string; 
  onRoleChange: (role: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const roles = [
    { value: 'ADMIN', label: 'Админ', color: 'bg-red-100 text-red-700' },
    { value: 'MANAGER', label: 'Менеджер', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'EMPLOYEE', label: 'Сотрудник', color: 'bg-blue-100 text-blue-700' },
  ];

  const handleRoleSelect = (role: string) => {
    onRoleChange(role);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs px-2 py-1 rounded border flex items-center gap-1 bg-white hover:bg-gray-50"
      >
        <span>Роль: </span>
        <span className={`font-bold ${
          currentRole === 'ADMIN' ? 'text-red-600' : 
          currentRole === 'MANAGER' ? 'text-yellow-600' : 
          'text-blue-600'
        }`}>
          {currentRole}
        </span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border z-20">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => handleRoleSelect(role.value)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 first:rounded-t-md last:rounded-b-md
                  ${currentRole === role.value ? 'bg-gray-100 font-medium' : ''}
                `}
              >
                <span className={`font-bold ${
                  role.value === 'ADMIN' ? 'text-red-600' : 
                  role.value === 'MANAGER' ? 'text-yellow-600' : 
                  'text-blue-600'
                }`}>
                  {role.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TaskBoard() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("EMPLOYEE");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [debugData, setDebugData] = useState<string>("Жду данные...");

  const lp = useLaunchParams();

  useEffect(() => {
    const initApp = async () => {
      try {
        let foundId = (lp as any)?.initData?.user?.id;

        if (!foundId && typeof window !== 'undefined') {
          const tg = (window as any).Telegram?.WebApp;
          foundId = tg?.initDataUnsafe?.user?.id;
        }

        const userId = foundId?.toString();
        setDebugData(`Найден ID: ${userId || 'НЕТ'}\nИсточник LP: ${!!lp}\nИсточник Window: ${!!((window as any).Telegram?.WebApp)}`);

        if (userId) {
          const savedRole = localStorage.getItem(`test_role_${userId}`);
          if (savedRole) {
            setUserRole(savedRole);
          } else {
            const role = await getUserRole(userId);
            setUserRole(role);
          }
        }

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

    setTimeout(initApp, 100);
  }, [lp]);

  const handleRoleChange = (newRole: string) => {
    setUserRole(newRole);
    const userId = (lp as any)?.initData?.user?.id?.toString() || 
                   (typeof window !== 'undefined' ? (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() : null);
    if (userId) {
      localStorage.setItem(`test_role_${userId}`, newRole);
    }
  };

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
          <pre className="text-[10px] bg-gray-100 p-1 mt-1 rounded text-red-600 overflow-x-auto max-w-[200px]">
            {debugData}
          </pre>
          <p className="text-xs text-gray-500 mt-1">Группа: {groupId || "Личное"}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <RoleSwitcher 
            currentRole={userRole} 
            onRoleChange={handleRoleChange}
          />
          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
            userRole === 'ADMIN' ? 'bg-red-100 text-red-700' : 
            userRole === 'MANAGER' ? 'bg-yellow-100 text-yellow-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            {userRole}
          </span>
        </div>
      </header>

      <main className="p-6 flex flex-col gap-6">
        {/* ✅ АДМИН И МЕНЕДЖЕР */}
        {(userRole === 'ADMIN' || userRole === 'MANAGER') ? (
          <>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="text-sm font-semibold mb-3">Новый сотрудник</h2>
              <AddEmployeeForm />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="text-sm font-semibold mb-3">Новая задача</h2>
              <TaskForm />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
              <h2 className="text-sm font-semibold mb-3 text-red-600">Система замечаний</h2>
              <PenaltyForm />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="text-sm font-semibold mb-3">Управление сотрудниками</h2>
              <EmployeeTable />
            </div>
          </>
        ) : (
          /* ✅ СОТРУДНИК */
          <>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="text-sm font-semibold mb-3">
                Текущие задачи на{" "}
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => setSelectedDate(date || new Date())}
                  locale="ru"
                  dateFormat="d MMMM"
                  customInput={
                    <button className="text-xs font-bold text-blue-600 underline decoration-dotted italic">
                      {formattedDateString}
                    </button>
                  }
                />
              </h2>
              <TaskList userRole={userRole} selectedDate={selectedDate} />
            </div>

            {/* ✅ ТОЛЬКО ДЛЯ СОТРУДНИКА - МОИ ЗАМЕЧАНИЯ */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
              <MyPenalties />
            </div>
          </>
        )}
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