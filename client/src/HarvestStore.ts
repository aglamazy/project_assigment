export type Project = { id: string; name: string };

const API_BASE = process.env.SERVER_URL || 'http://localhost:3001';

class HarvestStore {
  private projects: Project[] | null = null;
  private pending: Promise<Project[]> | null = null;

  async getProjects(): Promise<Project[]> {
    if (this.projects) {
      return Promise.resolve(this.projects);
    }
    if (this.pending) {
      return this.pending;
    }
    this.pending = fetch(`${API_BASE}/harvest/projects`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch projects: ${res.status}`);
        }
        const data: Project[] = await res.json();
        this.projects = data;
        this.pending = null;
        return data;
      })
      .catch((err) => {
        this.pending = null;
        throw err;
      });
    return this.pending;
  }

  clearCache(): void {
    this.projects = null;
  }
}

export const harvestStore = new HarvestStore();
export default harvestStore;
