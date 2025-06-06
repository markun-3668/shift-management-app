// app/confirm/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShiftContext } from '../../contexts/ShiftContext';
import { DAYS, HOURS } from '../../types';

export default function ConfirmPage() {
  const { state, dispatch } = useShiftContext();
  const router = useRouter();

  // 初期化されていない場合はホームにリダイレクト
  useEffect(() => {
    if (state.employeeCount === 0 || state.employees.length === 0) {
      router.push('/');
    }
  }, [state.employeeCount, state.employees.length, router]);

  const handleGenerateShift = () => {
    router.push('/result');
  };

  const isHourSelected = (employeeId: number, day: typeof DAYS[number], hour: number) => {
    const employee = state.employees.find(emp => emp.id === employeeId);
    if (!employee) return false;

    const dayPref = employee.preferences.find(pref => pref.day === day);
    return dayPref ? dayPref.hours.includes(hour as any) : false;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">シフト希望確認</h2>
          <p className="text-gray-600">
            各メンバーの希望シフトを確認してください。問題なければ「シフト表を生成する」ボタンを押してください。
          </p>
        </div>

        <div className="space-y-8">
          {state.employees.map((employee, index) => (
            <div key={employee.id} className="border-t pt-6 first:border-t-0 first:pt-0">
              <h3 className="text-lg font-medium mb-4">
                メンバー {index + 1}: {employee.name}
              </h3>
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
                            className={isHourSelected(employee.id, day, hour) ? 'shift-cell-available' : ''}
                          >
                            {isHourSelected(employee.id, day, hour) ? '○' : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={handleGenerateShift} 
            className="btn-primary text-lg px-8 py-3"
          >
            シフト表を生成する
          </button>
        </div>
      </div>
    </div>
  );
}