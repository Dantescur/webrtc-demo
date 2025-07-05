import type { LogEntry, LogLevel } from "@/shared";
import { ref } from "vue";

const logs = ref<LogEntry[]>([]);
const maxLogs = 200;

export function useWebRTCLogger() {
  const addLog = (level: LogLevel, message: string, data?: any) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      level,
      message,
      data,
    };

    logs.value.unshift(entry);

    if (logs.value.length > maxLogs) {
      logs.value = logs.value.slice(0, maxLogs);
    }

    const consoleMethod = console[level] || console.log;
    consoleMethod(`[WebRTC][${level}] ${message}`, data || "");
  };

  const clearLogs = () => {
    logs.value = [];
  };

  return {
    logs,
    addLog,
    clearLogs,
    error: (message: string, data?: any) => addLog("error", message, data),
    warn: (message: string, data?: any) => addLog("warn", message, data),
    info: (message: string, data?: any) => addLog("info", message, data),
    debug: (message: string, data?: any) => addLog("debug", message, data),
  };
}
