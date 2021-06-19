export const useRetry = () => {
  const sleep = (interval) => {
    return new Promise((resolve) => {
      setTimeout(resolve, interval);
    });
  };

  const retry = async (errorTypes, millisecondIntervals, operation) => {
    const isRetryType = (error) => errorTypes.some(type => error instanceof type);
    const intervals = millisecondIntervals[Symbol.iterator]();
    const tryOperatation = async () => {
      try {
        return await operation();
      } catch (err) {
        if (!isRetryType(err)) {
          throw err;
        }
      }
    }

    while (true) {
      const success = await tryOperatation();

      if (success) {
        return success;
      }

      const interval = intervals.next();

      if (interval.done) {
        throw new Error("No more retries.");
      }

      await sleep(interval.value);
    }
  };

  return {
    retry
  };
};
