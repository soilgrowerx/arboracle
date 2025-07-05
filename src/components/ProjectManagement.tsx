'use client';

import React, { useState, useEffect } from 'react';
import { Project, ProjectFormData } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Calendar, MapPin, User, FileText } from 'lucide-react';

interface ProjectManagementProps {
  onProjectSelect?: (project: Project) => void;
}

export const ProjectManagement: React.FC<ProjectManagementProps> = ({ onProjectSelect }) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    address: '',
    client: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    project_type: 'tree_inventory'
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    // TODO: Replace with actual API call
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Downtown Construction Site',
        address: '123 Main St, City, State',
        client: 'ABC Construction',
        description: 'Tree preservation monitoring during high-rise construction',
        start_date: '2025-01-01',
        status: 'active',
        project_type: 'construction_monitoring',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current_user'
      },
      {
        id: '2',
        name: 'City Park Inventory',
        address: 'Central Park, City, State',
        client: 'City Parks Department',
        description: 'Complete tree inventory and health assessment',
        start_date: '2025-02-01',
        status: 'active',
        project_type: 'tree_inventory',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current_user'
      }
    ];
    setProjects(mockProjects);
  };

  const handleCreateProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      ...formData,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current_user'
    };

    setProjects([...projects, newProject]);
    setIsCreateModalOpen(false);
    resetForm();
    
    toast({
      title: "Project Created",
      description: `${newProject.name} has been created successfully.`,
    });
  };

  const handleUpdateProject = () => {
    if (!editingProject) return;

    const updatedProject: Project = {
      ...editingProject,
      ...formData,
      updated_at: new Date().toISOString()
    };

    setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
    setEditingProject(null);
    resetForm();
    
    toast({
      title: "Project Updated",
      description: `${updatedProject.name} has been updated successfully.`,
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    toast({
      title: "Project Deleted",
      description: "Project has been deleted successfully.",
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      client: '',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      project_type: 'tree_inventory'
    });
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      address: project.address,
      client: project.client,
      description: project.description || '',
      start_date: project.start_date,
      end_date: project.end_date,
      project_type: project.project_type
    });
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectTypeLabel = (type: Project['project_type']) => {
    switch (type) {
      case 'construction_monitoring': return 'Construction Monitoring';
      case 'tree_inventory': return 'Tree Inventory';
      case 'health_assessment': return 'Health Assessment';
      case 'research': return 'Research';
      case 'other': return 'Other';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-800">Project Management</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateProject}
              onCancel={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-green-800">{project.name}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {project.client}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {project.address}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(project.start_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">
                    {getProjectTypeLabel(project.project_type)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {project.description && (
                <p className="text-gray-700 mb-4">{project.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onProjectSelect?.(project)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(project)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Project Modal */}
      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateProject}
            onCancel={() => {
              setEditingProject(null);
              resetForm();
            }}
            isEditing
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ProjectFormProps {
  formData: ProjectFormData;
  setFormData: (data: ProjectFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter project name"
          />
        </div>
        <div>
          <Label htmlFor="client">Client *</Label>
          <Input
            id="client"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            placeholder="Enter client name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter project address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="project_type">Project Type</Label>
          <Select
            value={formData.project_type}
            onValueChange={(value) => setFormData({ ...formData, project_type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="construction_monitoring">Construction Monitoring</SelectItem>
              <SelectItem value="tree_inventory">Tree Inventory</SelectItem>
              <SelectItem value="health_assessment">Health Assessment</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter project description"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700">
          {isEditing ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </div>
  );
};