import { Injectable } from '@nestjs/common';
import Axios from 'axios';
import { API_ENDPOINTS } from '../constants/db.constants';
import { IPlanActualProject, IProjectsData } from '../types';

@Injectable()
export class HarvestService {
  private _token?: string;
  private headers?: { Authorization: string };

  static async login(body: { userName: string; password: string }): Promise<string> {
    const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.LOGIN.LOGIN}`;
    const result = await Axios.post(url, body);
    return result.data.token;
  }

  static async googleLogin(googleToken: string): Promise<string> {
    const url = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.LOGIN.GOOGLE}`;
    const result = await Axios.post(url, { googleToken });
    return result.data.token;
  }

  set token(value: string) {
    this._token = value;
    this.headers = {
      Authorization: `Bearer ${this._token}`,
    };
  }

  protected get(endpoint: string, params: any = {}) {
    const url = `${API_ENDPOINTS.BASE_URL}${endpoint}`;
    return Axios.get(url, {
      headers: this.headers,
      params,
    });
  }

  async getTimeLogged(year: number, month: number) {
    const result = await this.get(API_ENDPOINTS.WORK.TIME_LOGGED_BY_DATES, { year, month });
    return result.data;
  }

  async getMaintenance(year: number, month: number) {
    const result = await this.get(API_ENDPOINTS.WORK.MAINTENANCE, { year, month });
    return result.data.projects;
  }

  async getPlanVsActual(year: number, month: number): Promise<IPlanActualProject[]> {
    const result = await this.get(API_ENDPOINTS.WORK.PLANvsACTUAL, { year, month });
    return result.data.projects;
  }

  async checkToken(token: string): Promise<boolean> {
    this._token = token;
    try {
      await this.get(API_ENDPOINTS.LOGIN.CHECK_TOKEN);
      return true;
    } catch {
      return false;
    }
  }

  async getProjects(month: number): Promise<IProjectsData> {
    const now = new Date();
    const result = await this.get(API_ENDPOINTS.DATA.PROJECTS, { month, year: now.getFullYear() });
    return {
      projects: result.data,
    };
  }
}
