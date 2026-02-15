// app/lib/penaltyCatalog.ts

// 1. Определяем 3 уровня тяжести (Категории)
export const PENALTY_TYPES = {
    MINOR: "Мелкое",      // Предупреждение или небольшой штраф
    MEDIUM: "Среднее",    // Ощутимый штраф
    SEVERE: "Серьезное"   // Штраф + объяснительная или увольнение
} as const;

// 2. Структура (убрали fineAmount, так как сумма не фиксирована)
export interface PenaltyTemplate {
    id: string;
    label: string;   // Название нарушения
    type: string;    // Категория (Мелкое/Среднее/Серьезное)
}

// 3. Список опций с твоими новыми формулировками
export const PENALTY_OPTIONS: PenaltyTemplate[] = [
    // --- МЕЛКИЕ НАРУШЕНИЯ ---
    {
        id: 'late_small',
        label: 'Опоздание до 15 минут',
        type: PENALTY_TYPES.MINOR
    },
    {
        id: 'untidy_look',
        label: 'Неопрятный внешний вид',
        type: PENALTY_TYPES.MINOR
    },

    // --- СРЕДНИЕ НАРУШЕНИЯ ---
    {
        id: 'late_big',
        label: 'Опоздание более 15 минут',
        type: PENALTY_TYPES.MEDIUM
    },
    {
        id: 'bad_behavior',
        label: 'Некорректное поведение',
        type: PENALTY_TYPES.MEDIUM
    },
    {
        id: 'disobedience',
        label: 'Невыполнение прямых указаний',
        type: PENALTY_TYPES.MEDIUM
    },

    // --- СЕРЬЕЗНЫЕ НАРУШЕНИЯ ---
    {
        id: 'safety_violation',
        label: 'Нарушение техники безопасности',
        type: PENALTY_TYPES.SEVERE
    },
    {
        id: 'alcohol',
        label: 'Появление в нетрезвом виде',
        type: PENALTY_TYPES.SEVERE
    },
];