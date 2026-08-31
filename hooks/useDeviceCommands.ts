import { useCallback, useRef, useState } from 'react';
import { parseCommand, ParsedCommand, generateConfirmationPrompt } from '../services/commandParser';
import { executeDeviceCommand, DeviceResponse } from '../services/deviceControlService';

export interface ConfirmationState {
  pending: ParsedCommand | null;
  prompt: string | null;
}

export function useDeviceCommands() {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    pending: null,
    prompt: null,
  });

  const lastCommandRef = useRef<ParsedCommand | null>(null);

  const parseUserMessage = useCallback((message: string): ParsedCommand => {
    const parsed = parseCommand(message);
    lastCommandRef.current = parsed;
    return parsed;
  }, []);

  const requestConfirmation = useCallback((parsed: ParsedCommand) => {
    const prompt = generateConfirmationPrompt(parsed);
    setConfirmationState({ pending: parsed, prompt });
  }, []);

  const confirmCommand = useCallback(async (): Promise<DeviceResponse | null> => {
    const { pending } = confirmationState;
    if (!pending || !pending.deviceCommand) {
      setConfirmationState({ pending: null, prompt: null });
      return null;
    }

    try {
      const response = await executeDeviceCommand(pending.deviceCommand);
      setConfirmationState({ pending: null, prompt: null });
      return response;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      setConfirmationState({ pending: null, prompt: null });
      return { success: false, message: msg };
    }
  }, [confirmationState]);

  const cancelCommand = useCallback(() => {
    setConfirmationState({ pending: null, prompt: null });
  }, []);

  return {
    confirmationState,
    parseUserMessage,
    requestConfirmation,
    confirmCommand,
    cancelCommand,
  };
}
