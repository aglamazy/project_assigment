const API_BASE = process.env.SERVER_URL || 'http://localhost:3001';

export interface Workday {
  date: string;
  workingHours: number;
}

class GlobalStore {
  working_days: number[] = [];
  private cache: Map<string, Workday[]> = new Map();
  private pending: Map<string, Promise<Workday[]>> = new Map();

  async getWorkingDays(year: number, month: number): Promise<Workday[]> {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    if (this.cache.has(key)) {
      const data = this.cache.get(key)!;
      this.working_days = data.map((d) => parseInt(d.date.slice(-2), 10));
      return Promise.resolve(data);
    }
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }
    const promise = fetch(
      `${API_BASE}/globals/working-days?year=${year}&month=${String(month).padStart(2, '0')}`,
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch working days: ${res.status}`);
        }
        const data: Workday[] = await res.json();
        data.sort((a, b) => a.date.localeCompare(b.date));
        this.cache.set(key, data);
        this.working_days = data.map((d) => parseInt(d.date.slice(-2), 10));
        this.pending.delete(key);
        return data;
      })
      .catch((err) => {
        this.pending.delete(key);
        throw err;
      });
    this.pending.set(key, promise);
    return promise;
  }

  clearCache() {
    this.cache.clear();
  }
}

export const globalStore = new GlobalStore();
export default globalStore;
