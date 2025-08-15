import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  Politician, 
  Referido, 
  LoginFormData, 
  ApiResponse, 
  Statistics,
  PaginationParams 
} from '../types/index';

// Configuración de la API
import { getApiUrl } from '../config/env';
const API_URL = getApiUrl();

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token de autenticación
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('dyc_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores de respuesta
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Solo redirigir si no estamos en la página de admin
          if (!window.location.pathname.includes('/admin')) {
            localStorage.removeItem('dyc_token');
            localStorage.removeItem('dyc_user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos para Referidos (públicos)
  async createReferido(data: LoginFormData): Promise<ApiResponse<Referido>> {
    const response = await this.api.post('/api/referidos', data);
    return response.data;
  }

  // Métodos para Estadísticas (públicos)
  async getStatistics(): Promise<ApiResponse<Statistics>> {
    const response = await this.api.get('/api/statistics');
    return response.data;
  }

  // Métodos para obtener candidatos (públicos)
  async getCandidates(): Promise<ApiResponse<{ politicians: Politician[]; pagination: PaginationParams }>> {
    const response = await this.api.get('/api/politicians?isCandidato=true&limit=100');
    return response.data;
  }

  // Métodos para OAuth
  async initiateGoogleOAuth(): Promise<void> {
    window.location.href = `${API_URL}/api/auth/oauth/google`;
  }

  // Métodos para Políticos (requieren autenticación)
  async getPoliticianProfile(uuid: string): Promise<ApiResponse<Politician>> {
    const response = await this.api.get(`/api/politicians/${uuid}`);
    return response.data;
  }

  async updatePoliticianProfile(uuid: string, data: Partial<Politician>): Promise<ApiResponse<Politician>> {
    const response = await this.api.patch(`/api/politicians/${uuid}`, data);
    return response.data;
  }

  // Métodos para Perfil del Usuario Autenticado
  async getMyProfile(): Promise<ApiResponse<Politician>> {
    const response = await this.api.get('/api/politicians/profile');
    return response.data;
  }

  async getMyProfileByUUID(uuid: string): Promise<ApiResponse<Politician>> {
    const response = await this.api.get(`/api/politicians/${uuid}`);
    return response.data;
  }

  async updateMyProfile(data: Partial<Politician> | FormData): Promise<ApiResponse<Politician>> {
    const response = await this.api.put('/api/politicians/profile', data, {
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    });
    return response.data;
  }

  // Métodos para Dashboard (requieren autenticación)
  async getMyReferidos(page: number = 1, limit: number = 10): Promise<ApiResponse<Referido[]>> {
    const response = await this.api.get(`/api/dashboard/referidos?page=${page}&limit=${limit}`);
    return response.data;
  }

  async updateReferido(uuid: string, data: Partial<Referido>): Promise<ApiResponse<Referido>> {
    const response = await this.api.patch(`/api/referidos/${uuid}`, data);
    return response.data;
  }

  async deleteReferido(uuid: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/api/referidos/${uuid}`);
    return response.data;
  }

  // Métodos para Representantes (requieren autenticación)
  async getRepresentativeDashboard(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/api/dashboard/representative');
    return response.data;
  }

  // Métodos para Admin (requieren autenticación admin)
  async adminLogin(username: string, password: string): Promise<ApiResponse<{ token: string }>> {
    const response = await this.api.post('/api/admin/login', { username, password });
    return response.data;
  }

  async getAuditLogs(page: number = 1, limit: number = 10): Promise<ApiResponse<any[]>> {
    const response = await this.api.get(`/api/admin/audit-logs?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getAdminDashboard(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/api/admin/dashboard');
    return response.data;
  }

  // Métodos de utilidad
  setAuthToken(token: string): void {
    localStorage.setItem('dyc_token', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('dyc_token');
  }

  removeAuthToken(): void {
    localStorage.removeItem('dyc_token');
    localStorage.removeItem('dyc_user');
  }

  setUser(user: any): void {
    localStorage.setItem('dyc_user', JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem('dyc_user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  logout(): void {
    this.removeAuthToken();
    window.location.href = '/';
  }
}

export const apiService = new ApiService();
export default apiService;
