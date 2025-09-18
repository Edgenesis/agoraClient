import { useState, useEffect } from 'react';
import { NatsConfig, loadNatsConfig, saveNatsConfig } from '@/lib/nats-config';
import { useNatsClient } from '@/hooks/useNatsClient';

interface NatsConfigProps {
  onConfigChange?: (config: NatsConfig) => void;
}

export const NatsConfigComponent = ({ onConfigChange }: NatsConfigProps) => {
  const [config, setConfig] = useState<NatsConfig>(loadNatsConfig);
  const [customMessage, setCustomMessage] = useState('');
  const [customFields, setCustomFields] = useState('{}');
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    isConnected,
    isConnecting,
    error,
    connectToNats,
    disconnect,
    publishToTopic1,
    publishToTopic2
  } = useNatsClient(config);

  useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  const handleConfigChange = (field: keyof NatsConfig, value: string | NatsConfig['data']) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    saveNatsConfig(newConfig);
  };

  const handleDataChange = (field: keyof NatsConfig['data'], value: string | boolean | Record<string, unknown>) => {
    const newData = { ...config.data, [field]: value };
    handleConfigChange('data', newData);
  };

  const handlePublishToTopic1 = async () => {
    try {
      let customData: Record<string, unknown> = {};

      if (customMessage) {
        customData.message = customMessage;
      }

      if (customFields && customFields !== '{}') {
        try {
          customData = { ...customData, ...JSON.parse(customFields) };
        } catch {
          alert('Invalid JSON in custom fields');
          return;
        }
      }

      await publishToTopic1(customData);
      alert(`Published to ${config.topic1}!`);
    } catch (error) {
      alert(`Failed to publish: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePublishToTopic2 = async () => {
    try {
      let customData: Record<string, unknown> = {};

      if (customMessage) {
        customData.message = customMessage;
      }

      if (customFields && customFields !== '{}') {
        try {
          customData = { ...customData, ...JSON.parse(customFields) };
        } catch {
          alert('Invalid JSON in custom fields');
          return;
        }
      }

      await publishToTopic2(customData);
      alert(`Published to ${config.topic2}!`);
    } catch (error) {
      alert(`Failed to publish: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          NATS Configuration
        </h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : error ? 'bg-red-500' : 'bg-gray-400'
          }`} />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {isConnected ? 'Connected' : error ? 'Error' : 'Disconnected'}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={isConnected ? disconnect : connectToNats}
          disabled={isConnecting}
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
            isConnected
              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
        </button>

        {isConnected && (
          <>
            <button
              onClick={handlePublishToTopic1}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Publish to Topic 1
            </button>
            <button
              onClick={handlePublishToTopic2}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Publish to Topic 2
            </button>
          </>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              NATS Server URL
            </label>
            <input
              type="text"
              value={config.serverUrl}
              onChange={(e) => handleConfigChange('serverUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="ws://localhost:8080"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic 1
              </label>
              <input
                type="text"
                value={config.topic1}
                onChange={(e) => handleConfigChange('topic1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="agora.events"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Topic 2
              </label>
              <input
                type="text"
                value={config.topic2}
                onChange={(e) => handleConfigChange('topic2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="agora.metrics"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Message
            </label>
            <input
              type="text"
              value={config.data.message}
              onChange={(e) => handleDataChange('message', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Hello from Agora Client"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeTimestamp"
              checked={config.data.timestamp}
              onChange={(e) => handleDataChange('timestamp', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includeTimestamp" className="text-sm text-gray-700 dark:text-gray-300">
              Include timestamp in messages
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Message (for publishing)
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Override default message"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Fields (JSON)
            </label>
            <textarea
              value={customFields}
              onChange={(e) => setCustomFields(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder='{"key": "value", "number": 42}'
              rows={3}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Additional fields to include in published messages
            </p>
          </div>
        </div>
      )}
    </div>
  );
};