"use client";

import { useState, useEffect } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Employee } from '../types/employee';
import { PENALTY_OPTIONS } from '@/app/lib/penaltyCatalog';

export default function PenaltyForm() {
    const [selectedPenaltyId, setSelectedPenaltyId] = useState<string>('');
    const [comment, setComment] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
        
        // Находим данные о нарушении в каталоге по ID из штата
        const template = PENALTY_OPTIONS.find(o => o.id === selectedPenaltyId);

        if (!selectedEmployeeId || !template || !db) {
            alert("Пожалуйста, выберите сотрудника и тип нарушения");
            return;
        }

        setIsLoading(true);
        try {
            await addDoc(collection(db, 'penalties'), {
                title: template.label,       // "Опоздание до 15 минут"
                type: template.type,         // "Мелкое"
                employeeId: selectedEmployeeId,
                comment: comment.trim(),     // Добавляем комментарий
                createdAt: new Date(),
            });

            // Очистка формы
            setSelectedPenaltyId('');
            setSelectedEmployeeId('');
            setComment('');
            alert("Замечание успешно добавлено");
        } catch (err) {
            console.error('Error adding penalty:', err);
        } finally {
            setIsLoading(false);
        }
    }; // <--- ЗАКРЫВАЕМ ФУНКЦИЮ ЗДЕСЬ

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-bold text-gray-800">Добавить замечание</h2>

            {/* Выбор сотрудника */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Сотрудник:</label>
                <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md text-black focus:ring-2 focus:ring-red-500"
                    required
                >
                    <option value="">Выберите сотрудника...</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                    ))}
                </select>
            </div>

            {/* Выбор типа нарушения */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип нарушения:</label>
                <select
                    value={selectedPenaltyId}
                    onChange={(e) => setSelectedPenaltyId(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md bg-white text-black focus:ring-2 focus:ring-red-500"
                    required
                >
                    <option value="">-- Выберите из списка --</option>
                    {PENALTY_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {selectedPenaltyId && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                        Категория: {PENALTY_OPTIONS.find(o => o.id === selectedPenaltyId)?.type}
                    </p>
                )}
            </div>

            {/* Поле для комментария (новое) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий (необязательно):</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md text-black focus:ring-2 focus:ring-blue-500"
                    placeholder="Детали нарушения..."
                    rows={3}
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 font-bold transition-colors"
            >
                {isLoading ? 'Сохранение...' : 'Зафиксировать нарушение'}
            </button>
        </form>
    );
}