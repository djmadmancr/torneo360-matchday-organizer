
import { useState, useEffect } from 'react';
import { LogEntry, UserLogs } from '@/types/logs';

export const useLogs = (userId: string) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const savedLogs = localStorage.getItem('userLogs');
    if (savedLogs) {
      const allLogs: UserLogs[] = JSON.parse(savedLogs);
      const userLogs = allLogs.find(ul => ul.userId === userId);
      if (userLogs) {
        setLogs(userLogs.logs);
      }
    }
  }, [userId]);

  const addLog = (accion: string, detalles: string, tipo: LogEntry['tipo'], entidad?: string, entidadId?: string) => {
    const newLog: LogEntry = {
      id: `LOG-${Date.now()}`,
      fecha: new Date().toLocaleDateString('es-ES'),
      hora: new Date().toLocaleTimeString('es-ES'),
      accion,
      detalles,
      tipo,
      entidad,
      entidadId
    };

    const updatedLogs = [newLog, ...logs].slice(0, 100); // Mantener solo los últimos 100 logs
    setLogs(updatedLogs);

    // Guardar en localStorage
    const savedLogs = localStorage.getItem('userLogs');
    const allLogs: UserLogs[] = savedLogs ? JSON.parse(savedLogs) : [];
    const userLogIndex = allLogs.findIndex(ul => ul.userId === userId);
    
    if (userLogIndex >= 0) {
      allLogs[userLogIndex].logs = updatedLogs;
    } else {
      allLogs.push({ userId, logs: updatedLogs });
    }
    
    localStorage.setItem('userLogs', JSON.stringify(allLogs));
  };

  return { logs, addLog };
};
