import { useMemo } from 'react';
import { usePrefs } from '../state/usePrefs';

export interface JourneyProgress {
  completedMap: Record<number, boolean>;
  unlockedMap: Record<number, boolean>;
  completedCount: number;
  total: number;
  latestIndex: number;
}

/**
 * Sequential-unlock journey progress. Ported from open777Native, with the
 * `journey/path_<n>.txt` file-existence model replaced by the persisted
 * `journeyCompleted` map in usePrefs. Path i is unlocked iff i-1 is complete
 * (index 0 always unlocked).
 */
export function useJourneyProgress(pathNums: number[]): JourneyProgress {
  const completedMap = usePrefs((s) => s.journeyCompleted);
  return useMemo(() => {
    const unlocked: Record<number, boolean> = {};
    for (let i = 0; i < pathNums.length; i++) {
      unlocked[pathNums[i]] = i === 0 ? true : !!completedMap[pathNums[i - 1]];
    }
    let latest = 0;
    for (let i = 0; i < pathNums.length; i++) {
      if (unlocked[pathNums[i]] && !completedMap[pathNums[i]]) {
        latest = i;
        break;
      }
    }
    const completedCount = pathNums.reduce((a, p) => a + (completedMap[p] ? 1 : 0), 0);
    return { completedMap, unlockedMap: unlocked, completedCount, total: pathNums.length, latestIndex: latest };
  }, [completedMap, pathNums]);
}
