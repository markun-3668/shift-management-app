import { Employee, ShiftSchedule, Chromosome, IsActive, DAYS, HOURS } from '../types';

// ------------------↓↓↓大竹↓↓↓------------------------------------

// 希望がある時間帯を特定
const getRequestedTimeSlots = (employees: Employee[]): IsActive => {
  const requestedSlots: IsActive = {};
  
  DAYS.forEach(day => {
    requestedSlots[day] = {};
    HOURS.forEach(hour => {
      requestedSlots[day][hour] = false;
    });
  });
  
  // 誰かが希望を出している時間帯をマーク
  employees.forEach(employee => {
    employee.preferences.forEach(pref => {
      pref.hours.forEach(hour => {
        requestedSlots[pref.day][hour] = true;
      });
    });
  });
  
  return requestedSlots;
};

// 初期スケジュールを生成
const createEmptySchedule = (): ShiftSchedule => {
  const schedule: ShiftSchedule = {};
  
  DAYS.forEach(day => {
    schedule[day] = {};
    HOURS.forEach(hour => {
      schedule[day][hour] = [];
    });
  });
  
  return schedule;
};

// 個体（染色体）の初期集団を生成
const initializePopulation = (employees: Employee[], populationSize: number, requestedSlots: IsActive): Chromosome[] => {
  const population: Chromosome[] = [];
  
  for (let i = 0; i < populationSize; i++) {
    const schedule = createEmptySchedule();
    
    // ランダムにシフトを割り当て
    employees.forEach(employee => {
      employee.preferences.forEach(pref => {
        pref.hours.forEach(hour => {
          // 50%の確率でこの時間帯に割り当てる
          // ただし、既に2人配置されている場合は追加しない
          if (Math.random() > 0.5 && schedule[pref.day][hour].length < 2) {
            schedule[pref.day][hour].push(employee.name);
          }
        });
      });
    });
    
    // 誰も希望していない時間帯のシフトを削除
    DAYS.forEach(day => {
      HOURS.forEach(hour => {
        if (!requestedSlots[day][hour]) {
          schedule[day][hour] = [];
        }
      });
    });
    
    population.push({
      schedule,
      fitness: calculateFitness(schedule, employees, requestedSlots)
    });
  }
  
  return population;
};

// --------------------------↑↑↑大竹↑↑↑-----------------------------------

// ------------------↓↓↓大橋↓↓↓------------------------------------

// 適応度（fitness）の計算
const calculateFitness = (schedule: ShiftSchedule, employees: Employee[], requestedSlots: IsActive): number => {
  let fitness = 0;
  
  // 希望シフトとの一致度を評価
  employees.forEach(employee => {
    employee.preferences.forEach(pref => {
      pref.hours.forEach(hour => {
        if (schedule[pref.day][hour].includes(employee.name)) {
          fitness += 1; // 希望通りのシフトが入っていればポイント加算
        }
      });
    });
  });
  
  // シフトの均等さを評価
  const employeeHours: { [key: string]: number } = {};
  employees.forEach(employee => {
    employeeHours[employee.name] = 0;
  });
  
  DAYS.forEach(day => {
    HOURS.forEach(hour => {
      schedule[day][hour].forEach(name => {
        employeeHours[name] = (employeeHours[name] || 0) + 1;
      });
    });
  });
  
  // 労働時間の標準偏差を計算（小さいほど良い = 均等に割り当てられている）
  const values = Object.values(employeeHours);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  
  // 標準偏差が小さいほど良いので、減算する（重みづけ）
  fitness -= std * 2;
  
  // 時間帯ごとに適切な人数が配置されているかを評価
  DAYS.forEach(day => {
    HOURS.forEach(hour => {
      // 希望がない時間帯はスキップ
      if (!requestedSlots[day][hour]) {
        // 希望がない時間帯に人が配置されている場合は大きなペナルティ
        if (schedule[day][hour].length > 0) {
          fitness -= 100;
        }
        return;
      }
      
      const count = schedule[day][hour].length;
      if (count < 1) {
        // シフトが0人の場合はペナルティ（希望がある時間帯のみ）
        fitness -= 5;
      } else if (count > 2) {
        // シフトが2人より多い場合は大きなペナルティ
        fitness -= (count - 2) * 10;
      }
    });
  });
  
  return fitness;
};

// --------------------------↑↑↑大橋↑↑↑-----------------------------------

// ------------------↓↓↓内山↓↓↓------------------------------------


// 選択（トーナメント選択）
const selection = (population: Chromosome[], tournamentSize: number): Chromosome => {
  const tournament: Chromosome[] = [];
  
  for (let i = 0; i < tournamentSize; i++) {
    const randomIdx = Math.floor(Math.random() * population.length);
    tournament.push(population[randomIdx]);
  }
  
  return tournament.reduce((best, current) => 
    current.fitness > best.fitness ? current : best, tournament[0]);
};

// --------------------------↑↑↑内山↑↑↑-----------------------------------

// ------------------↓↓↓大竹↓↓↓------------------------------------

// 交叉
const crossover = (parent1: Chromosome, parent2: Chromosome, requestedSlots: IsActive): Chromosome => {
  const childSchedule = createEmptySchedule();
  
  DAYS.forEach(day => {
    // 日ごとに親を選択
    const selectedParent = Math.random() > 0.5 ? parent1 : parent2;
    HOURS.forEach(hour => {
      // 希望がない時間帯は空のままにする
      if (requestedSlots[day][hour]) {
        // 最大2人までに制限
        const employees = [...selectedParent.schedule[day][hour]];
        if (employees.length > 2) {
          employees.length = 2;
        }
        childSchedule[day][hour] = employees;
      }
    });
  });
  
  return {
    schedule: childSchedule,
    fitness: 0 // 後で計算する
  };
};

// --------------------------↑↑↑大竹↑↑↑-----------------------------------

// ------------------↓↓↓内山↓↓↓------------------------------------

// 突然変異
const mutate = (chromosome: Chromosome, employees: Employee[], mutationRate: number, requestedSlots: IsActive): Chromosome => {
  const schedule = JSON.parse(JSON.stringify(chromosome.schedule)) as ShiftSchedule;
  
  DAYS.forEach(day => {
    HOURS.forEach(hour => {
      // 希望がない時間帯は変異させない
      if (!requestedSlots[day][hour]) {
        // 希望がない時間帯のシフトを確実に空にする
        schedule[day][hour] = [];
      } else if (Math.random() < mutationRate) {
        // 希望を出している従業員だけをフィルタリング
        const eligibleEmployees = employees.filter(emp => 
          emp.preferences.some(pref => 
            pref.day === day && pref.hours.includes(hour as any)
          )
        );
        
        if (eligibleEmployees.length > 0) {
          // ランダムに従業員を選択して追加または削除
          const randomEmployee = eligibleEmployees[Math.floor(Math.random() * eligibleEmployees.length)];
          const employeeIndex = schedule[day][hour].indexOf(randomEmployee.name);
          
          if (employeeIndex >= 0) {
            // 従業員が既に割り当てられている場合は削除
            schedule[day][hour].splice(employeeIndex, 1);
          } else if (schedule[day][hour].length < 2) {
            // 2人未満の場合のみ追加
            schedule[day][hour].push(randomEmployee.name);
          }
        }
      }
    });
  });
  
  return {
    schedule,
    fitness: 0 // 後で計算する
  };
};

// --------------------------↑↑↑内山↑↑↑-----------------------------------

// ------------------↓↓↓大竹↓↓↓------------------------------------

// 結果の検証と修正
const validateAndFixSchedule = (schedule: ShiftSchedule, requestedSlots: IsActive): ShiftSchedule => {
  const fixedSchedule = JSON.parse(JSON.stringify(schedule)) as ShiftSchedule;
  
  DAYS.forEach(day => {
    HOURS.forEach(hour => {
      // 希望がない時間帯は確実に空にする
      if (!requestedSlots[day][hour]) {
        fixedSchedule[day][hour] = [];
      } else if (fixedSchedule[day][hour].length > 2) {
        // 2人を超える場合は2人に制限
        fixedSchedule[day][hour] = fixedSchedule[day][hour].slice(0, 2);
      }
    });
  });
  
  return fixedSchedule;
};

// 遺伝的アルゴリズムの実行
export const generateShiftSchedule = (employees: Employee[]): ShiftSchedule => {
  const POPULATION_SIZE = 50;
  const MAX_GENERATIONS = 100;
  const TOURNAMENT_SIZE = 3;
  const MUTATION_RATE = 0.1;
  
  // 希望がある時間帯を特定
  const requestedSlots = getRequestedTimeSlots(employees);
  
  // 初期集団の生成
  let population = initializePopulation(employees, POPULATION_SIZE, requestedSlots);
  
  // 各個体の適応度を計算
  population.forEach(individual => {
    individual.fitness = calculateFitness(individual.schedule, employees, requestedSlots);
  });
  
  // 世代を繰り返す
  for (let generation = 0; generation < MAX_GENERATIONS; generation++) {
    const newPopulation: Chromosome[] = [];
    
    // エリート保存（最も適応度の高い個体を次世代に残す）
    population.sort((a, b) => b.fitness - a.fitness);
    newPopulation.push(JSON.parse(JSON.stringify(population[0])));
    
    // 新しい個体を生成
    while (newPopulation.length < POPULATION_SIZE) {
      // 選択
      const parent1 = selection(population, TOURNAMENT_SIZE);
      const parent2 = selection(population, TOURNAMENT_SIZE);
      
      // 交叉
      let child = crossover(parent1, parent2, requestedSlots);
      
      // 突然変異
      child = mutate(child, employees, MUTATION_RATE, requestedSlots);
      
      // 適応度の計算
      child.fitness = calculateFitness(child.schedule, employees, requestedSlots);
      
      newPopulation.push(child);
    }
    
    population = newPopulation;
  }
  
  // 最も適応度の高い個体を返す
  population.sort((a, b) => b.fitness - a.fitness);
  
  // 最終的な結果を検証・修正して返す
  return validateAndFixSchedule(population[0].schedule, requestedSlots);
};