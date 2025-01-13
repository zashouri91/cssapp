import { useState, useEffect } from 'react';

interface AnalyticsUpdate {
  newResponses: any[];
  metrics: {
    totalResponses: number;
    averageRating: number;
    responseRate: number;
  };
  distributions: {
    ratings: any[];
    drivers: any[];
    locations: any[];
  };
}

export function useAnalyticsStream() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<AnalyticsUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource;

    const connect = () => {
      try {
        eventSource = new EventSource('/api/analytics/stream');

        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastUpdate(data);
          } catch (err) {
            console.error('Error parsing SSE data:', err);
          }
        };

        eventSource.onerror = (err) => {
          console.error('SSE error:', err);
          setIsConnected(false);
          setError('Connection lost. Retrying...');
          eventSource.close();
          // Attempt to reconnect after 5 seconds
          setTimeout(connect, 5000);
        };
      } catch (err) {
        console.error('Error creating EventSource:', err);
        setError('Failed to connect to analytics stream');
      }
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return {
    isConnected,
    lastUpdate,
    error,
  };
}

// Helper hook for specific metrics
export function useMetricStream<T>(
  selector: (update: AnalyticsUpdate) => T,
  initialValue: T
) {
  const [value, setValue] = useState<T>(initialValue);
  const { lastUpdate } = useAnalyticsStream();

  useEffect(() => {
    if (lastUpdate) {
      setValue(selector(lastUpdate));
    }
  }, [lastUpdate, selector]);

  return value;
}
