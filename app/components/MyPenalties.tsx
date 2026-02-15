"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Penalty } from '../types/penalty';
import { useLaunchParams } from "@telegram-apps/sdk-react";
import IncidentSummaryCard from '@/app/components/horizontal-bar-chart';

export default function MyPenalties() {
    const [penalties, setPenalties] = useState<Penalty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [employeeId, setEmployeeId] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        critical: 0,
        serious: 0,
        medium: 0,
        minor: 0
    });

    const lp = useLaunchParams();

    // Подготовка данных для графика
const chartData = [
  { key: 'Критические', data: stats.critical },
  { key: 'Серьезные', data: stats.serious },
  { key: 'Средние', data: stats.medium },
  { key: 'Мелкие', data: stats.minor },
];

    // Получаем ID текущего сотрудника
    useEffect(() => {
        const getCurrentEmployeeId = async () => {
            try {
                // Получаем Telegram ID
                let telegramId = (lp as any)?.initData?.user?.id?.toString();

                if (!telegramId && typeof window !== 'undefined') {
                    const tg = (window as any).Telegram?.WebApp;
                    telegramId = tg?.initDataUnsafe?.user?.id?.toString();
                }

                if (telegramId) {
                    // Ищем сотрудника по telegramId в Firestore
                    const employeesRef = collection(db, 'employees');
                    const q = query(employeesRef, where('telegramId', '==', telegramId));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const employee = querySnapshot.docs[0];
                        setEmployeeId(employee.id);
                    }
                }
            } catch (err) {
                console.error('Ошибка при получении ID сотрудника:', err);
            }
        };

        getCurrentEmployeeId();
    }, [lp]);

    // Подписываемся на замечания сотрудника
    useEffect(() => {
        if (!employeeId) {
            setIsLoading(false);
            return;
        }

        const penaltiesRef = collection(db, 'penalties');
        const q = query(
            penaltiesRef,
            where('employeeId', '==', employeeId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const penaltiesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Penalty));

            setPenalties(penaltiesList);

            // Подсчитываем статистику
            const newStats = {
                total: penaltiesList.length,
                critical: penaltiesList.filter(p => p.type === 'Критическое').length,
                serious: penaltiesList.filter(p => p.type === 'Серьезное').length,
                minor: penaltiesList.filter(p => p.type === 'Мелкое').length,
                medium: penaltiesList.filter(p => p.type === 'Среднее').length

            };
            setStats(newStats);

            setIsLoading(false);
        }, (error) => {
            console.error('Ошибка при загрузке замечаний:', error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [employeeId]);

    // Форматирование даты
    const formatDate = (date: any) => {
        if (!date) return 'Дата не указана';
        try {
            const d = date.toDate ? date.toDate() : new Date(date);
            return d.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return 'Дата не указана';
        }
    };

    // Цвета для типов замечаний
    const getTypeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'критическое':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'серьезное':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'среднее':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'мелкое':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!employeeId) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Сотрудник не найден</h3>
                    <p className="text-sm text-gray-500">
                        Ваш аккаунт не привязан к профилю сотрудника
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Шапка со статистикой */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 border-b">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Мои замечания
                </h2>

                <div className="grid grid-cols-5 gap-2">
                    <div className="bg-white bg-opacity-70 rounded-lg p-2 text-center">
                        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-xs text-gray-600">Всего</div>
                    </div>
                    <div className="bg-red-100 bg-opacity-70 rounded-lg p-2 text-center">
                        <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
                        <div className="text-xs text-red-600">Крит</div>
                    </div>
                    <div className="bg-orange-100 bg-opacity-70 rounded-lg p-2 text-center">
                        <div className="text-2xl font-bold text-orange-700">{stats.serious}</div>
                        <div className="text-xs text-orange-600">Серьез.</div>
                    </div>
                    <div className="bg-blue-100 bg-opacity-70 rounded-lg p-2 text-center">
                        <div className="text-2xl font-bold text-blue-700">{stats.medium}</div> {/* Исправлено: stats.medium */}
                        <div className="text-xs text-blue-600">Сред.</div>
                    </div>
                    <div className="bg-yellow-100 bg-opacity-70 rounded-lg p-2 text-center">
                        <div className="text-2xl font-bold text-yellow-700">{stats.minor}</div>
                        <div className="text-xs text-yellow-600">Мелких</div>
                    </div>
                </div>
            </div>

            {/* Список замечаний */}
            <div className="p-4">
                {penalties.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="w-16 h-16 text-green-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">У вас нет замечаний</h3>
                        <p className="text-sm text-gray-500">
                            Отличная работа! Продолжайте в том же духе
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                        {penalties.map((penalty) => (
                            <div
                                key={penalty.id}
                                className={`
                                    border rounded-lg p-3 transition-all hover:shadow-md
                                    ${getTypeColor(penalty.type)}
                                `}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white bg-opacity-60">
                                                {penalty.type || 'Замечание'}
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                {formatDate(penalty.createdAt)}
                                            </span>
                                        </div>

                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                            {penalty.title}
                                        </h4>

                                        {penalty.comment && (
                                            <p className="text-xs text-gray-700 bg-white bg-opacity-50 p-2 rounded mt-1">
                                                {penalty.comment}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Подвал с информацией */}
            {penalties.length > 0 && (
                <div className="bg-gray-50 p-3 border-t text-center">
                    <p className="text-xs text-gray-500">
                        Замечания сгорают через 3 месяца с даты получения
                    </p>
                </div>
            )}
            <div className="p-4">
  <IncidentSummaryCard 
    data={chartData}
    title="Распределение по типам"
    // showMetrics={true} // если хотите показать маленькие цифры под графиком
  />
</div>
        </div>
        
    );
    
}