"use client";

import { useState, useEffect } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Employee } from '../types/employee';

export default function AddEmployeeForm() {
    const [employeeName, setEmployeeName] = useState<string>('');
    const [employeePosition, setEmployeePosition] = useState('');
    const [employeeBasePremium, setEmployeeBasePremium] = useState<number>();
    const [isLoading, setIsLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);

// Подгружаем список сотрудников
    useEffect(() => {
        const fetchEmployees = async () => {
            const querySnapshot = await getDocs(collection(db, 'employees'));
            const emps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
            setEmployees(emps);
        };
        fetchEmployees();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

          // Валидация
        if (!employeeName.trim()) {
            alert("Введите имя сотрудника");
            return;
        }

        setIsLoading(true);
        try {
            await addDoc(collection(db, 'employees'), {
                fullName: employeeName,       // "Опоздание до 15 минут"
                position: employeePosition,
                basePremium: employeeBasePremium,     // Добавляем комментарий
                createdAt: new Date(),
            });

            // Очистка формы
            setEmployeeName('');
            setEmployeePosition('');
            setEmployeeBasePremium(undefined);
            alert("Работник добавлен успешно");
        } catch (err) {
            console.error('Error adding employee:', err);
        } finally {
            setIsLoading(false);
        }
    }; // <--- ЗАКРЫВАЕМ ФУНКЦИЮ ЗДЕСЬ

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">
                    ФИО сотрудника
                </label>
                <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Должность
                </label>
                <input
                    type="text"
                    value={employeePosition}
                    onChange={(e) => setEmployeePosition(e.target.value)}
                    placeholder="Менеджер"
                    className="w-full px-3 py-2 border rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Базовая премия
                </label>
                <input
                    type="number"
                    value={employeeBasePremium}
                    onChange={(e) => setEmployeeBasePremium(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
                {isLoading ? 'Добавление...' : 'Добавить сотрудника'}
            </button>
        </form>
    );
}