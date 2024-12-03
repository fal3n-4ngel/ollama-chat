"use client";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { Bot, ChevronDown } from "lucide-react";

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

const ModelSelector = ({
  currentModel,
  onModelChange,
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
        const response = await fetch("http://localhost:11434/api/tags");
        if (!response.ok) {
          throw new Error("Failed to fetch models");
        }
        const data = await response.json();
        setModels(data.models);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch models");
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  if (loading) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 border-2 border-black rounded-lg hover:bg-blue-400 dark:bg-[#2d2d2d] bg-white shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="font-bold">Loading models...</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-2 border-black bg-white dark:bg-[#2d2d2d] rounded-lg shadow-[4px_4px_0_rgba(0,0,0,1)] overflow-hidden"
        >
          <DropdownMenuItem disabled className="px-4 py-3">
            Loading models...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (error) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 border-2 border-black dark:bg-[#2d2d2d] rounded-lg hover:bg-blue-400 bg-white shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="font-bold">Error loading models</span>
          </div>
          <ChevronDown className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-2 border-black dark:bg-[#2d2d2d] bg-white rounded-lg shadow-[4px_4px_0_rgba(0,0,0,1)] overflow-hidden"
        >
          <DropdownMenuItem disabled className="px-4 py-3 ">
            Error loading models
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 dark:bg-[#2d2d2d] py-2 border-2 border-black rounded-lg hover:bg-blue-400 bg-white shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all">
        <div className="flex items-center gap-2 ">
          <Bot className="w-5 h-5" />
          <span className="font-bold">{currentModel}</span>
        </div>
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-2 border-black bg-white rounded-lg shadow-[4px_4px_0_rgba(0,0,0,1)] overflow-hidden dark:bg-[#2d2d2d]"
      >
        {models.map((model) => (
          <DropdownMenuItem
            key={model.digest}
            onClick={() => onModelChange(model.name)}
            className="px-4 py-3 hover:bg-blue-400 border-b border-black last:border-b-0 cursor-pointer"
          >
            <div>
              <div className="flex gap-4">
                <Bot className="w-5 h-5" />
                <div className="font-bold">{model.name}</div>
              </div>
              <div className="text-xs text-zinc-400">
                {Math.round(model.size / (1024 * 1024 * 1024))}GB
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelSelector;
