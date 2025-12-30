"use client";

import { useState, useCallback } from 'react';
import type { ChainhookRequest, ChainhookResponse } from '@/lib/types/chainhooks';

export function useChainhooks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T,>(
    url: string,
    options?: RequestInit
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listChainhooks = useCallback(async (): Promise<ChainhookResponse[]> => {
    return handleRequest('/api/chainhooks');
  }, [handleRequest]);

  const registerChainhook = useCallback(async (
    request: ChainhookRequest
  ): Promise<ChainhookResponse> => {
    return handleRequest('/api/chainhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }, [handleRequest]);

  const getChainhook = useCallback(async (uuid: string): Promise<ChainhookResponse> => {
    return handleRequest(`/api/chainhooks/${uuid}`);
  }, [handleRequest]);

  const updateChainhook = useCallback(async (
    uuid: string,
    data: any
  ): Promise<ChainhookResponse> => {
    return handleRequest(`/api/chainhooks/${uuid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }, [handleRequest]);

  const deleteChainhook = useCallback(async (uuid: string): Promise<void> => {
    return handleRequest(`/api/chainhooks/${uuid}`, {
      method: 'DELETE',
    });
  }, [handleRequest]);

  const toggleChainhook = useCallback(async (
    uuid: string,
    enabled: boolean
  ): Promise<void> => {
    return handleRequest(`/api/chainhooks/${uuid}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
  }, [handleRequest]);

  return {
    loading,
    error,
    listChainhooks,
    registerChainhook,
    getChainhook,
    updateChainhook,
    deleteChainhook,
    toggleChainhook,
  };
}
