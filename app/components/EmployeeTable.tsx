"use client"; // Директива Next.js. Она говорит: "Этот код выполняется в браузере пользователя, а не на сервере". 
              // Это нужно, т.к. мы используем useEffect и useState (браузерные функции).

import { useState, useEffect } from 'react'; // Импорт стандартных инструментов React (Hooks).
import { collection, query, onSnapshot } from 'firebase/firestore'; // Импорт методов Firebase для работы с БД.
import { db } from '@/app/lib/firebase'; // Подключение нашего конфига Firebase (где лежит ключ доступа к БД).
import { Employee } from '../types/employee'; // Импорт "чертежа" данных, чтобы TypeScript знал, какие поля есть у работника.

/**
 * Основная функция компонента. В React компонент — это функция, 
 * которая возвращает визуальную разметку (HTML).
 */
export default function EmployeeTable() {
    
    // --- 1. СОСТОЯНИЕ (STATE) ---
    // useState — это "память" компонента. 
    // employees: текущий список работников.
    // setEmployees: функция, которой мы будем заменять этот список.
    // <Employee[]>: подсказка TypeScript, что в массиве будут только объекты типа Employee.
    const [employees, setEmployees] = useState<Employee[]>([]);

    // --- 2. ПОБОЧНЫЕ ЭФФЕКТЫ (EFFECTS) ---
    // useEffect запускается один раз при "рождении" (монтировании) компонента на экране.
    useEffect(() => {
        
        // Создаем запрос (инструкцию) для базы данных.
        // Говорим: "Мы хотим смотреть в коллекцию под названием 'employees'".
        const q = query(collection(db, 'employees'));

        // onSnapshot — это "живая подписка". 
        // Если кто-то изменит данные в консоли Firebase, эта функция сработает мгновенно без перезагрузки страницы.
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            
            const empList: Employee[] = []; // Временная корзина для сбора данных из БД.

            // Проходим циклом по всем документам, которые прислал Firebase (snapshot).
            querySnapshot.forEach((doc) => {
                // doc.id — это уникальный ключ документа в базе.
                // ...doc.data() — это "распаковка" всех полей документа (имя, должность и т.д.).
                // as unknown as Employee — принудительно заставляем TypeScript верить, что данные из БД 
                // соответствуют нашему интерфейсу.
                empList.push({ id: doc.id, ...doc.data() } as unknown as Employee);
            });

            // Сохраняем собранный список в "память" (state). 
            // Как только мы вызываем setEmployees, React понимает: "Данные изменились, пора перерисовать таблицу!".
            setEmployees(empList);
        });

        // Функция очистки (cleanup). 
        // Когда пользователь уйдет с этой страницы, мы "отпишемся" от базы, чтобы не тратить интернет и ресурсы.
        return () => unsubscribe();
        
    }, []); // Пустые скобки [] означают: "Запусти этот код только 1 раз при старте".

    // --- 3. ОТОБРАЖЕНИЕ (RENDER) ---
    return (
        /* overflow-x-auto позволяет скроллить таблицу вбок на узких экранах телефонов */
        <div className="overflow-x-auto mt-4">
            
            {/* Стандартный HTML тег таблицы */}
            <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg">
                
                {/* thead — "шапка" таблицы */}
                <thead className="bg-gray-50">
                    <tr>
                        {/* th — ячейка заголовка (обычно жирным шрифтом) */}
                        <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">ФИО</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Должность</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Премия</th>
                    </tr>
                </thead>

                {/* tbody — "тело" таблицы, где лежат реальные данные */}
                <tbody className="divide-y divide-gray-100">
                    
                    {/* map — это цикл в React. Для каждого работника (emp) в массиве 
                        он создаст новую строку <tr> */}
                    {employees.map((emp) => (
                        /* key — уникальный паспорт строки. Нужен React для оптимизации. */
                        <tr key={emp.id} className="hover:bg-gray-50 transition-colors text-black">
                            {/* td — ячейка с данными */}
                            <td className="px-4 py-3 text-sm">{emp.fullName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{emp.position}</td>
                            <td className="px-4 py-3 text-sm font-medium text-green-600">
                                {emp.basePremium} ₽
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Условный рендеринг: если работников 0, покажем надпись об их отсутствии */}
            {employees.length === 0 && (
                <div className="text-center py-10 text-gray-400">Сотрудники не найдены</div>
            )}
        </div>
    );
}