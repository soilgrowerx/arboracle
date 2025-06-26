export interface Project {
  id: string;
  project_name: string;
  project_address: string;
  client_name: string;
  created_date: string;
  status: 'active' | 'completed' | 'on_hold';
  tree_count?: number;
}

export class ProjectService {
  private static readonly STORAGE_KEY = 'arboracle_projects';

  static getAllProjects(): Project[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultProjects();
    } catch (error) {
      console.error('Error loading projects:', error);
      return this.getDefaultProjects();
    }
  }

  static saveProject(project: Omit<Project, 'id' | 'created_date'>): Project {
    const projects = this.getAllProjects();
    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_date: new Date().toISOString(),
      tree_count: 0,
      ...project
    };
    
    projects.push(newProject);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    return newProject;
  }

  static updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    projects[index] = { ...projects[index], ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    return projects[index];
  }

  static deleteProject(id: string): boolean {
    const projects = this.getAllProjects();
    const filtered = projects.filter(p => p.id !== id);
    
    if (filtered.length === projects.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  static getProjectById(id: string): Project | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id) || null;
  }

  private static getDefaultProjects(): Project[] {
    return [
      {
        id: 'demo_project_1',
        project_name: 'Sage at Franklin Construction Site',
        project_address: '123 Franklin Street, Portland, OR',
        client_name: 'Franklin Development Corp',
        created_date: '2024-01-15T00:00:00Z',
        status: 'active',
        tree_count: 3
      },
      {
        id: 'demo_project_2', 
        project_name: 'Central Park Restoration',
        project_address: 'Central Park, New York, NY',
        client_name: 'NYC Parks Department',
        created_date: '2024-02-20T00:00:00Z',
        status: 'active',
        tree_count: 12
      }
    ];
  }
}