import { useState } from 'react';

interface UsePointAllocationOptions {
  totalPoints: number;
  minPerStat: number;
  maxPerStat: number;
  stats: string[];
}

export function usePointAllocation({
  totalPoints,
  minPerStat,
  maxPerStat,
  stats,
}: UsePointAllocationOptions) {
  const [allocation, setAllocation] = useState<Record<string, number>>(
    stats.reduce((acc, stat) => ({ ...acc, [stat]: minPerStat }), {})
  );

  const allocated = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  const remaining = totalPoints - allocated;

  const increment = (stat: string) => {
    if (remaining > 0 && allocation[stat] < maxPerStat) {
      setAllocation({ ...allocation, [stat]: allocation[stat] + 1 });
    }
  };

  const decrement = (stat: string) => {
    if (allocation[stat] > minPerStat) {
      setAllocation({ ...allocation, [stat]: allocation[stat] - 1 });
    }
  };

  const setValue = (stat: string, value: number) => {
    if (value >= minPerStat && value <= maxPerStat) {
      setAllocation({ ...allocation, [stat]: value });
    }
  };

  const reset = () => {
    setAllocation(stats.reduce((acc, stat) => ({ ...acc, [stat]: minPerStat }), {}));
  };

  const isValid = remaining === 0;

  return {
    allocation,
    allocated,
    remaining,
    increment,
    decrement,
    setValue,
    reset,
    isValid,
  };
}
