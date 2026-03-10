import apiClient from './api.service';
import { ApiResponse, Character } from '../types/api.type';

// Récupère une page de personnages avec recherche optionnelle
export const getCharacters = async (
  page: number = 1,
  name: string = ''
): Promise<ApiResponse<Character>> => {
  const params: Record<string, string | number> = { page };
  if (name.trim()) params.name = name.trim();

  const response = await apiClient.get<ApiResponse<Character>>('/character', { params });
  return response.data;
};
