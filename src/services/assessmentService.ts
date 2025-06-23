import { ConditionAssessment } from '@/types/assessment';

const STORAGE_KEY = 'arboracle_condition_assessments';

export class AssessmentService {
  static getAllAssessments(): ConditionAssessment[] {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static getAssessmentsByTreeId(treeId: string): ConditionAssessment[] {
    const allAssessments = this.getAllAssessments();
    return allAssessments.filter(assessment => assessment.treeId === treeId);
  }

  static getLatestAssessment(treeId: string): ConditionAssessment | null {
    const treeAssessments = this.getAssessmentsByTreeId(treeId);
    if (treeAssessments.length === 0) return null;
    
    // Sort by date and return the most recent
    return treeAssessments.sort((a, b) => 
      new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    )[0];
  }

  static addAssessment(assessment: Omit<ConditionAssessment, 'id' | 'created_at' | 'updated_at'>): ConditionAssessment {
    const allAssessments = this.getAllAssessments();
    
    const newAssessment: ConditionAssessment = {
      ...assessment,
      id: `assessment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    allAssessments.push(newAssessment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allAssessments));
    
    return newAssessment;
  }

  static updateAssessment(id: string, updates: Partial<ConditionAssessment>): ConditionAssessment | null {
    const allAssessments = this.getAllAssessments();
    const index = allAssessments.findIndex(a => a.id === id);
    
    if (index === -1) return null;
    
    allAssessments[index] = {
      ...allAssessments[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allAssessments));
    return allAssessments[index];
  }

  static deleteAssessment(id: string): boolean {
    const allAssessments = this.getAllAssessments();
    const filteredAssessments = allAssessments.filter(a => a.id !== id);
    
    if (filteredAssessments.length === allAssessments.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAssessments));
    return true;
  }
}