'use client';

import React from 'react';
import {
  BarChart,
  LinearYAxis,
  LinearYAxisTickSeries,
  LinearYAxisTickLabel,
  LinearXAxis,
  LinearXAxisTickSeries,
  BarSeries,
  Bar,
  GridlineSeries,
  Gridline,
} from 'reaviz';
import { motion } from 'framer-motion';

// Интерфейс для пропсов компонента
interface IncidentSummaryCardProps {
  data?: Array<{ key: string; data: number }>; // данные для графика
  colors?: string[];                           // цвета для колонок
  title?: string;                               // заголовок
  showMetrics?: boolean;                         // показывать ли метрики (нижний блок)
}

// Компонент теперь принимает пропсы
export default function IncidentSummaryCard({ 
  data = [
    { key: 'Критические', data: 0 },
    { key: 'Серьезные', data: 0 },
    { key: 'Средние', data: 0 },
    { key: 'Мелкие', data: 0 },
  ],
  colors = ['#EF4444', '#F97316', '#3B82F6', '#EAB308'], // ваши цвета
  title = "Статистика замечаний",
  showMetrics = false // по умолчанию метрики не показываем (можно включить если нужно)
}: IncidentSummaryCardProps) {

  // Валидация данных
  const validatedData = data.map(item => ({
    key: item.key,
    data: (typeof item.data === 'number' && !isNaN(item.data)) ? item.data : 0,
  }));

  // Пример метрик (если нужно будет показать)
  const metrics = [
    {
      id: 'critical',
      label: 'Критических',
      value: data.find(d => d.key === 'Критические')?.data || 0,
      color: 'text-red-600',
    },
    {
      id: 'serious',
      label: 'Серьезных',
      value: data.find(d => d.key === 'Серьезные')?.data || 0,
      color: 'text-orange-600',
    },
    {
      id: 'medium',
      label: 'Средних',
      value: data.find(d => d.key === 'Средние')?.data || 0,
      color: 'text-blue-600',
    },
    {
      id: 'minor',
      label: 'Мелких',
      value: data.find(d => d.key === 'Мелкие')?.data || 0,
      color: 'text-yellow-600',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden"
    >
      {/* Заголовок */}
      {title && (
        <div className="px-4 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      )}

      {/* График */}
      <div className="px-2 py-4 h-[200px] w-full">
        <BarChart
          id="penalties-chart"
          height={200}
          width={350} // можно сделать адаптивным через CSS, но пока так
          data={validatedData}
          yAxis={
            <LinearYAxis
              type="category"
              tickSeries={
                <LinearYAxisTickSeries
                  label={
                    <LinearYAxisTickLabel
                      format={(text: string) => text.length > 6 ? `${text.slice(0, 6)}...` : text}
                      fill="#6B7280"
                    />
                  }
                />
              }
            />
          }
          xAxis={
            <LinearXAxis
              type="value"
              axisLine={null}
              tickSeries={
                <LinearXAxisTickSeries
                  label={null}
                  line={null}
                  tickSize={10}
                />
              }
            />
          }
          series={
            <BarSeries
              layout="horizontal"
              bar={
                <Bar
                  glow={{
                    blur: 10,
                    opacity: 0.3,
                  }}
                  gradient={null}
                />
              }
              colorScheme={colors}
              padding={0.2}
            />
          }
          gridlines={
            <GridlineSeries
              line={<Gridline strokeColor="#E5E7EB" />}
            />
          }
        />
      </div>

      {/* Опциональные метрики (компактные) */}
      {showMetrics && (
        <div className="grid grid-cols-4 gap-1 px-2 pb-4">
          {metrics.map(metric => (
            <div key={metric.id} className="text-center">
              <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
              <div className="text-[10px] text-gray-500 truncate">{metric.label}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}