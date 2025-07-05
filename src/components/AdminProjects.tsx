'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { ProjectService } from '@/services/projectService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export const AdminProjects: React.FC = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAddress, setNewProjectAddress] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    setProjects(ProjectService.getAllProjects());
  }, []);

  const handleAddProject = () => {
    if (newProjectName && newProjectAddress && newProjectClient) {
      const addedProject = ProjectService.addProject({
        name: newProjectName,
        address: newProjectAddress,
        client: newProjectClient,
      });
      setProjects((prev) => [...prev, addedProject]);
      setNewProjectName('');
      setNewProjectAddress('');
      setNewProjectClient('');
      toast({
        title: "Project Added",
        description: `${addedProject.name} has been added.`,
      });
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all project fields.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewProjectAddress(project.address);
    setNewProjectClient(project.client);
  };

  const handleUpdateProject = () => {
    if (editingProject && newProjectName && newProjectAddress && newProjectClient) {
      const updatedProject = ProjectService.updateProject({
        ...editingProject,
        name: newProjectName,
        address: newProjectAddress,
        client: newProjectClient,
      });
      if (updatedProject) {
        setProjects((prev) =>
          prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
        );
        setEditingProject(null);
        setNewProjectName('');
        setNewProjectAddress('');
        setNewProjectClient('');
        toast({
          title: "Project Updated",
          description: `${updatedProject.name} has been updated.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update project.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all project fields.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      if (ProjectService.deleteProject(id)) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toast({
          title: "Project Deleted",
          description: "Project has been removed.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete project.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-green-800">Manage Projects</h2>

      {/* Add/Edit Project Form */}
      <div className="dashboard-card-enhanced p-4 space-y-4">
        <h3 className="text-lg font-semibold text-green-700">
          {editingProject ? 'Edit Project' : 'Add New Project'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="projectAddress">Address</Label>
            <Input
              id="projectAddress"
              value={newProjectAddress}
              onChange={(e) => setNewProjectAddress(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="projectClient">Client</Label>
            <Input
              id="projectClient"
              value={newProjectClient}
              onChange={(e) => setNewProjectClient(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {editingProject && (
            <Button variant="outline" onClick={() => {
              setEditingProject(null);
              setNewProjectName('');
              setNewProjectAddress('');
              setNewProjectClient('');
            }}>
              Cancel
            </Button>
          )}
          <Button onClick={editingProject ? handleUpdateProject : handleAddProject}>
            {editingProject ? <><Edit size={18} className="mr-2" /> Update Project</> : <><PlusCircle size={18} className="mr-2" /> Add Project</>}
          </Button>
        </div>
      </div>

      {/* Projects List */}
      <div className="dashboard-card-enhanced p-4">
        <h3 className="text-lg font-semibold text-green-700 mb-4">Existing Projects</h3>
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects added yet.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
              >
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-gray-600">{project.address}</p>
                  <p className="text-xs text-gray-500">Client: {project.client}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(project)}>
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
