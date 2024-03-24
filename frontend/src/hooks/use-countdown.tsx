import dayjs from 'dayjs';
import {useEffect, useMemo, useState} from 'react';
import {findDateDifference} from '../utils/date-utils';

type UseContdownProps = {
  initialDate?: dayjs.Dayjs;
};

export function useCountdown(props?: UseContdownProps) {
  const dateAddThreeDays = useMemo(() => dayjs(new Date()).add(3, 'day'), []);

  const [_, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prevTimeElapsed => prevTimeElapsed + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return findDateDifference(props?.initialDate ?? dateAddThreeDays);
}
