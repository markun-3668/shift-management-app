// app/result/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShiftContext } from '../../contexts/ShiftContext';
import { generateShiftSchedule } from '../../utils/geneticAlgorithm';
import { DAYS, HOURS, ShiftSchedule } from '../../types';

export default function ResultPage() {
  const { state, dispatch } = useShiftContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<ShiftSchedule | null>(null);

  // 初期化されていない場合はホームにリダイレクト
  useEffect(() => {
    if (state.employeeCount === 0 || state.employees.length === 0) {
      router.push('/');
      return;
    }

    // シフト表を生成
    const generateSchedule = async () => {
      try {
        setLoading(true);
        // 非同期処理をシミュレート
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const generatedSchedule = generateShiftSchedule(state.employees);
        setSchedule(generatedSchedule);
        dispatch({ type: 'SET_GENERATED_SCHEDULE', payload: generatedSchedule });
      } catch (error) {
        console.error('シフト表生成エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    generateSchedule();
  }, [state.employeeCount, state.employees, dispatch, router]);

  const getAssignedEmployees = (day: string, hour: number) => {
    return schedule ? schedule[day][hour] : [];
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET' });
    router.push('/');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">生成されたシフト表</h2>
          <p className="text-gray-600">
            遺伝的アルゴリズムを用いて最適化されたシフト表が生成されました。
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg">シフト表を生成中...</p>
          </div>
        ) : schedule ? (
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
                    {HOURS.map(hour => {
                      const employees = getAssignedEmployees(day, hour);
                      return (
                        <td 
                          key={`${day}-${hour}`} 
                          className={employees.length > 0 ? 'shift-cell-assigned' : ''}
                        >
                          {employees.length > 0 ? (
                            <div className="text-xs">
                              {employees.join(', ')}
                            </div>
                          ) : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-red-600">シフト表の生成に失敗しました。やり直してください。</p>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">シフト表の要約</h3>
          {!loading && schedule && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {state.employees.map(employee => {
                // 従業員ごとの合計シフト時間を計算
                let totalHours = 0;
                DAYS.forEach(day => {
                  HOURS.forEach(hour => {
                    if (schedule[day][hour].includes(employee.name)) {
                      totalHours++;
                    }
                  });
                });

                return (
                  <div key={employee.id} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium">{employee.name}</h4>
                    <p className="text-gray-700">合計勤務時間: {totalHours}時間</p>
                    <div className="mt-2 text-sm">
                      {DAYS.map(day => {
                        const dayHours = HOURS.filter(hour => 
                          schedule[day][hour].includes(employee.name)
                        );
                        
                        if (dayHours.length === 0) return null;
                        
                        return (
                          <div key={day} className="mb-1">
                            <span className="font-medium">{day}曜: </span>
                            {dayHours.map(hour => `${hour}:00`).join(', ')}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={handleRestart} 
            className="btn-primary text-lg px-8 py-3"
          >
            最初から入力する
          </button>
        </div>
      </div>
    </div>
  );
}