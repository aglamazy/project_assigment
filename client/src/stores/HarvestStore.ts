export type Project = { id: string; name: string };
export type TeamMember = { id: string; name: string };

const API_BASE = process.env.SERVER_URL || 'http://localhost:3001';

class HarvestStore {
  private projects: Project[] | null = null;
  private projectsPending: Promise<Project[]> | null = null;
  private teamMembers: TeamMember[] | null = null;
  private teamMembersPending: Promise<TeamMember[]> | null = null;

  async getProjects(): Promise<Project[]> {
    if (this.projects) {
      return Promise.resolve(this.projects);
    }
    if (this.projectsPending) {
      return this.projectsPending;
    }
    this.projectsPending = fetch(`${API_BASE}/harvest/clients`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch projects: ${res.status}`);
        }
        const data: Project[] = await res.json();
        this.projects = data;
        this.projectsPending = null;
        return data;
      })
      .catch((err) => {
        this.projectsPending = null;
        throw err;
      });
    return this.projectsPending;
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    if (this.teamMembers) {
      return Promise.resolve(this.teamMembers);
    }
    if (this.teamMembersPending) {
      return this.teamMembersPending;
    }
    this.teamMembersPending = fetch(`${API_BASE}/harvest/team-members`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch team members: ${res.status}`);
        }
        const data: TeamMember[] = await res.json();
        this.teamMembers = data;
        this.teamMembersPending = null;
        return data;
      })
      .catch((err) => {
        this.teamMembersPending = null;
        throw err;
      });
    return this.teamMembersPending;
  }

  clearCache(): void {
    this.projects = null;
    this.teamMembers = null;
  }
}

export const harvestStore = new HarvestStore();
export default harvestStore;
