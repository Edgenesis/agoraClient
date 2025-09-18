import { useState, useEffect, useCallback, useRef } from 'react';
import { connect, NatsConnection } from 'nats.ws';
import { NatsConfig } from '@/lib/nats-config';

interface NatsClientState {
  connection: NatsConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export const useNatsClient = (config: NatsConfig) => {
  const [state, setState] = useState<NatsClientState>({
    connection: null,
    isConnected: false,
    isConnecting: false,
    error: null
  });

  const connectionRef = useRef<NatsConnection | null>(null);

  const connectToNats = useCallback(async () => {
    if (state.isConnecting || state.isConnected) return;

    setState(prev => ({
      ...prev,
      isConnecting: true,
      error: null
    }));

    try {
      const nc = await connect({
        servers: [config.serverUrl]
      });

      connectionRef.current = nc;

      setState(prev => ({
        ...prev,
        connection: nc,
        isConnected: true,
        isConnecting: false,
        error: null
      }));

      // Handle connection events
      (async () => {
        for await (const s of nc.status()) {
          console.log(`NATS connection status: ${s.type}: ${s.data}`);
          if (s.type === 'disconnect' || s.type === 'reconnecting') {
            setState(prev => ({
              ...prev,
              isConnected: false,
              error: s.type === 'disconnect' ? 'Disconnected from NATS server' : 'Reconnecting...'
            }));
          } else if (s.type === 'reconnect') {
            setState(prev => ({
              ...prev,
              isConnected: true,
              error: null
            }));
          }
        }
      })();

    } catch (error) {
      console.error('Failed to connect to NATS:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect to NATS server'
      }));
    }
  }, [config.serverUrl, state.isConnecting, state.isConnected]);

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.close();
      } catch (error) {
        console.error('Error closing NATS connection:', error);
      }
      connectionRef.current = null;
    }

    setState({
      connection: null,
      isConnected: false,
      isConnecting: false,
      error: null
    });
  }, []);

  const publishToTopic = useCallback(async (topic: string, data: string | { message?: string }) => {
    if (!state.connection || !state.isConnected) {
      throw new Error('Not connected to NATS server');
    }

    try {
      // Send string data directly without JSON wrapper
      const message = typeof data === 'string' ? data : data.message || '';

      state.connection.publish(topic, new TextEncoder().encode(message));
      console.log(`Published to ${topic}:`, message);
    } catch (error) {
      console.error(`Failed to publish to ${topic}:`, error);
      throw error;
    }
  }, [state.connection, state.isConnected]);

  const publishToTopic1 = useCallback(async (customData?: string | Record<string, unknown>) => {
    if (typeof customData === 'string') {
      await publishToTopic(config.topic1, customData);
    } else {
      const message = customData?.message as string || config.data.message || '';
      await publishToTopic(config.topic1, message);
    }
  }, [config.topic1, config.data.message, publishToTopic]);

  const publishToTopic2 = useCallback(async (customData?: string | Record<string, unknown>) => {
    if (typeof customData === 'string') {
      await publishToTopic(config.topic2, customData);
    } else {
      const message = customData?.message as string || config.data.message || '';
      await publishToTopic(config.topic2, message);
    }
  }, [config.topic2, config.data.message, publishToTopic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.close().catch(console.error);
      }
    };
  }, []);

  return {
    ...state,
    connectToNats,
    disconnect,
    publishToTopic1,
    publishToTopic2,
    publishToTopic
  };
};