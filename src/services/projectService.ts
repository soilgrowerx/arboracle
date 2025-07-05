import { Project } from '@/types/project';
import { v4 as uuidv4 } from 'uuid';

const PROJECTS_STORAGE_KEY = 'arboracle_projects';

export class ProjectService {
  static getAllProjects(): Project[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(PROJECTS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading projects from localStorage:', error);
      return [];
    }
  }

  static saveProjects(projects: Project[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects to localStorage:', error);
    }
  }

  static addProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project {
    const projects = this.getAllProjects();
    const newProject: Project = {
      id: uuidv4(),
      ...project,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  static updateProject(updatedProject: Project): Project | null {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === updatedProject.id);
    if (index === -1) return null;

    projects[index] = { ...updatedProject, updated_at: new Date().toISOString() };
    this.saveProjects(projects);
    return projects[index];
  }

  static deleteProject(id: string): boolean {
    const projects = this.getAllProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    if (filteredProjects.length === projects.length) return false; // No project was deleted
    this.saveProjects(filteredProjects);
    return true;
  }

  static getProjectById(id: string): Project | undefined {
    return this.getAllProjects().find(project => project.id === id);
  }
}
