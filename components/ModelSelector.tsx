"use client"
import { useState, useEffect } from 'react';

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

const ModelSelector = ({ 
  currentModel, 
  onModelChange 
}: { 
  currentModel: string;
  onModelChange: (model: string) => void;
}) => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        setModels(data.models);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch models');
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  if (loading) {
    return (
      <select 
        disabled 
        className="w-full p-3 border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200 text-gray-500"
      >
        <option>Loading models...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select 
        disabled 
        className="w-full p-3 border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200 text-red-500"
      >
        <option>Error loading models</option>
      </select>
    );
  }

  return (
    <select
      value={currentModel}
      onChange={(e) => onModelChange(e.target.value)}
      className="w-full p-3 border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200"
    >
      {models.map((model) => (
        <option key={model.digest} value={model.name}>
          {model.name} ({Math.round(model.size / (1024 * 1024 * 1024))}GB)
        </option>
      ))}
    </select>
  );
};

export default ModelSelector;