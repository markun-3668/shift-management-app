// app/input-shifts/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useShiftContext } from '../../contexts/ShiftContext';
import { DAYS, HOURS, ShiftPreference, Employee } from '../../types';

export default function InputShiftsPage() {
  const { state, dispatch } = useShiftContext();
  const router = useRouter();
  const [name, setName] = useState('');
  const [preferences, setPreferences] = useState<ShiftPreference[]>(
    DAYS.map(day => ({ day, hours: [] }))
  );
  const formRef = useRef<HTMLDivElement>(null);

  // 初期化されていない場合はホームにリダイレクト
  useEffect(() => {
    if (state.employeeCount === 0) {
      router.push('/');
    }
  }, [state.employeeCount, router]);

  // 新しい従業員の入力時に画面を最上部にスクロール
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
      setName('');
      setPreferences(DAYS.map(day => ({ day, hours: [] })));
    }
  }, [state.currentEmployeeIndex]);

  const toggleHour = (day: typeof DAYS[number], hour: number) => {
    const dayIndex = preferences.findIndex(pref => pref.day === day);
    if (dayIndex === -1) return;

    const updatedPreferences = [...preferences];
    const hourIndex = updatedPreferences[dayIndex].hours.indexOf(hour as any);

    if (hourIndex === -1) {
      updatedPreferences[dayIndex].hours.push(hour as any);
    } else {
      updatedPreferences[dayIndex].hours.splice(hourIndex, 1);
    }

    setPreferences(updatedPreferences);
  };

  const isHourSelected = (day: typeof DAYS[number], hour: number) => {
    const dayPref = preferences.find(pref => pref.day === day);
    return dayPref ? dayPref.hours.includes(hour as any) : false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('名前を入力してください');
      return;
    }

    const newEmployee: Employee = {
      id: state.currentEmployeeIndex,
      name: name.trim(),
      preferences: [...preferences]
    };

    dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });

    // 全員の入力が完了したら確認ページへ
    if (state.currentEmployeeIndex + 1 >= state.employeeCount) {
      router.push('/confirm');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md" ref={formRef}>
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">
            メンバー {state.currentEmployeeIndex + 1}/{state.employeeCount} の希望シフト入力
          </h2>
          <p className="text-gray-600">
            それぞれの曜日で働ける時間帯を選択してください
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="employee-name" className="block text-gray-700 font-medium mb-2">
              名前
            </label>
            <input
              type="text"
              id="employee-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="名前を入力"
              required
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">シフト希望時間</h3>
            <div className="overflow-x-auto">
              <table className="shift-table">
                <thead>
                  <tr>
                    <th className="w-20">曜日</th>
                    {HOURS.map(hour => (
                      <th key={hour}>{hour}:00</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map(day => (
                    <tr key={day}>
                      <td className="font-medium">{day}</td>
                      {HOURS.map(hour => (
                        <td 
                          key={`${day}-${hour}`} 
                          className={`cursor-pointer ${isHourSelected(day, hour) ? 'shift-cell-available' : ''}`}
                          onClick={() => toggleHour(day, hour)}
                        >
                          {isHourSelected(day, hour) ? '○' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center">
            <button type="submit" className="btn-primary w-full md:w-auto">
              {state.currentEmployeeIndex + 1 >= state.employeeCount ? '確認へ進む' : '次の従業員の入力へ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}