import { apiClient } from './client';
import { ThreadResponse, SendMessageRequest } from '../types/api';

export async function getThreadHistory(threadId: string): Promise<ThreadResponse> {
  return apiClient.get<ThreadResponse>(`/api/v1/threads/${threadId}`);
}

export async function sendMessage(
  threadId: string,
  text: string
): Promise<Response> {
  const body: SendMessageRequest = { text };
  return apiClient.post(`/api/v1/threads/${threadId}`, body);
}
