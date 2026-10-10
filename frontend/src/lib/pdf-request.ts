import { isAxiosError } from 'axios';
import { api } from './api';

/** Fetches a PDF as a Blob; turns JSON error bodies back into readable API errors. */
export async function pdfRequest(path: string, body?: unknown, signal?: AbortSignal): Promise<Blob> {
  try {
    const response = await api.request<Blob>({ url: path, method: body ? 'POST' : 'GET', data: body, responseType: 'blob', signal });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.data instanceof Blob) {
      try { error.response.data = JSON.parse(await error.response.data.text()); } catch { /* Keep the original request error. */ }
    }
    throw error;
  }
}

export const loadReceiptPdf = (id: string, signal?: AbortSignal): Promise<Blob> => pdfRequest(`/payments/receipts/${id}/pdf`, undefined, signal);
