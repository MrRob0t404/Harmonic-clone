import { useEffect, useState, useCallback, useRef } from "react";

const useApi = <T>(apiFunction: () => Promise<T>) => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<T | null>(null);

  const fetchData = useCallback(() => {
    if (cacheRef.current) {
      setData(cacheRef.current);
      return;
    }

    setLoading(true);
    apiFunction()
      .then((response) => {
        setData(response);
        cacheRef.current = response;
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    cacheRef.current = null;
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh };
};

export default useApi;
