"use client";

import { useState, useEffect } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Employee } from '../types/employee';

export default function AddEmployeeForm() {
    const [employeeName, setEmployeeName] = useState<string>('');
    const [employeePosition, setEmployeePosition] = useState('');
    const [employeeBasePremium, setEmployeeBasePremium] = useState<number | null>(null);
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
                fullName: employeeName,
                position: employeePosition || "Сотрудник", // Значение по умолчанию
                basePremium: employeeBasePremium || 0,
                isActive: true,
                task: ""
            });

            // Очистка формы
            setEmployeeName('');
            setEmployeePosition('');
            setEmployeeBasePremium(null);
            alert("Работник добавлен успешно");
        } catch (err) {
            console.error('Error adding employee:', err);
            alert("Ошибка при добавлении работника");
        } finally {
            setIsLoading(false);
        }
    };

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
                    placeholder="Грузчик"
                    className="w-full px-3 py-2 border rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">
                    Базовая премия
                </label>
                <input
                    type="number"
                    value={employeeBasePremium === null ? '' : employeeBasePremium}
                    onChange={(e) => {
                        const value = e.target.value;
                        setEmployeeBasePremium(value === '' ? null : Number(value));
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg"
                    min="0"
                    step="1"
                />
            </div>

            {/* ⚠️ ВАЖНО: Кнопка должна быть НА ОДНОМ УРОВНЕ с div, не внутри него! */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
                {isLoading ? 'Добавление...' : 'Добавить сотрудника'}
            </button>
        </form>
    );
}