export interface NatsConfig {
  serverUrl: string;
  topic1: string;
  topic2: string;
  data: {
    message: string;
    timestamp?: boolean;
    customFields?: Record<string, unknown>;
  };
}

export const defaultNatsConfig: NatsConfig = {
  serverUrl: 'ws://localhost:8080',
  topic1: 'agora.events',
  topic2: 'agora.metrics',
  data: {
    message: 'Hello from Agora Client',
    timestamp: true,
    customFields: {}
  }
};

export const loadNatsConfig = (): NatsConfig => {
  if (typeof window === 'undefined') return defaultNatsConfig;

  try {
    const saved = localStorage.getItem('nats-config');
    if (saved) {
      return { ...defaultNatsConfig, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Failed to load NATS config from localStorage:', error);
  }
  return defaultNatsConfig;
};

export const saveNatsConfig = (config: NatsConfig): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('nats-config', JSON.stringify(config));
  } catch (error) {
    console.warn('Failed to save NATS config to localStorage:', error);
  }
};