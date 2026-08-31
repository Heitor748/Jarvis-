import { useCallback, useState } from 'react';
import {
  executeDeviceCommand,
  DeviceCommand,
  DeviceResponse,
} from '../services/deviceControlService';

export interface UseDeviceControlState {
  isExecuting: boolean;
  lastResponse: DeviceResponse | null;
  error: string | null;
}

export function useDeviceControl() {
  const [state, setState] = useState<UseDeviceControlState>({
    isExecuting: false,
    lastResponse: null,
    error: null,
  });

  const executeCommand = useCallback(async (cmd: DeviceCommand): Promise<DeviceResponse> => {
    setState({ isExecuting: true, lastResponse: null, error: null });
    try {
      const response = await executeDeviceCommand(cmd);
      setState({
        isExecuting: false,
        lastResponse: response,
        error: response.success ? null : response.message,
      });
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setState({
        isExecuting: false,
        lastResponse: null,
        error: errorMsg,
      });
      return { success: false, message: errorMsg };
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    executeCommand,
    clearError,
  };
}
