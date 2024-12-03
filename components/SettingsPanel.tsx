import React, { useEffect } from 'react';
import { Settings, Moon, Sun, Zap, Mail, Globe, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface Settings {
  debugMode: boolean;
  baseUrl: string;
  gravatarEmail: string;
  historySize: number;
  darkMode: boolean;
  soundEnabled: boolean;
  apiKey: string;
  temperature: number;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingChange: (key: keyof Settings, value: unknown) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingChange,
}) => {
  // On component mount, retrieve Gravatar email from localStorage
  useEffect(() => {
    const storedGravatarEmail = localStorage.getItem('gravatarEmail');
    if (storedGravatarEmail && !settings.gravatarEmail) {
      onSettingChange('gravatarEmail', storedGravatarEmail);
    }
  }, [settings.gravatarEmail, onSettingChange]);

  // Update localStorage when Gravatar email changes
  const handleGravatarEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    onSettingChange('gravatarEmail', email);
    localStorage.setItem('gravatarEmail', email); // Save the new email to localStorage
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-[#2d2d2d] border-l-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] transform transition-transform duration-200 z-50">
      <div className="p-4 border-b-2 border-black">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings size={24} />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-yellow-400 rounded-lg border-2 border-black"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
        {/* Debug Mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-bold flex items-center gap-2">
              <Zap size={18} />
              Debug Mode
            </Label>
            <Switch
              checked={settings.debugMode}
              onCheckedChange={(checked) => onSettingChange('debugMode', checked)}
            />
          </div>
          <p className="text-sm text-zinc-600">Enable detailed logging and debugging tools</p>
        </div>

        {/* Base URL */}
        <div className="space-y-2">
          <Label className="font-bold flex items-center gap-2">
            <Globe size={18} />
            Base URL
          </Label>
          <input
            type="text"
            value={settings.baseUrl}
            onChange={(e) => onSettingChange('baseUrl', e.target.value)}
            className="w-full px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0_rgba(0,0,0,1)] dark:bg-[#4d4d4d]"
            placeholder="http://localhost:11434/api"
          />
        </div>

        {/* Gravatar Email */}
        <div className="space-y-2">
          <Label className="font-bold flex items-center gap-2">
            <Mail size={18} />
            Gravatar Email
          </Label>
          <input
            type="email"
            value={settings.gravatarEmail}
            onChange={handleGravatarEmailChange} // Use the new handler
            className="w-full px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0_rgba(0,0,0,1)] dark:bg-[#4d4d4d]"
          />
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-bold flex items-center gap-2">
              {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
              Dark Mode
            </Label>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => onSettingChange('darkMode', checked)}
            />
          </div>
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <Label className="font-bold flex items-center gap-2">
            <Shield size={18} />
            API Key
          </Label>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => onSettingChange('apiKey', e.target.value)}
            className="w-full px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0_rgba(0,0,0,1)] dark:bg-[#4d4d4d]"
            placeholder="Enter your API key"
          />
        </div>

        {/* Temperature Slider */}
        <div className="space-y-2">
          <Label className="font-bold">Temperature</Label>
          <div className="space-y-2">
            <Slider
              value={[settings.temperature]}
              onValueChange={([value]) => onSettingChange('temperature', value)}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="text-sm text-zinc-600">
              Controls randomness: 0 is focused, 1 is creative
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
