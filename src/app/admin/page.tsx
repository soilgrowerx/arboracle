'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tree } from '@/types';
import { TreeService } from '@/services/treeService';
import { Project, ProjectService } from '@/services/projectService';
import { AddTreeModal } from '@/components/AddTreeModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { 
  Trash2, MapPin, Calendar, Shield, CheckCircle, Clock, ArrowLeft, 
  Edit, Users, TreePine, Settings, Search, Filter, Crown, User, 
  BarChart3, Database, Lock, Unlock, FolderOpen, Plus, Building
} from 'lucide-react';
import Link from 'next/link';
import { calculateTreeAge } from '@/lib/utils';

// Mock user data for demonstration
const mockUsers = [
  { id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', joinDate: '2024-01-15', treesAdded: 12 },
  { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', role: 'curator', status: 'active', joinDate: '2024-02-20', treesAdded: 8 },
  { id: 'user3', name: 'Bob Wilson', email: 'bob@example.com', role: 'user', status: 'active', joinDate: '2024-03-10', treesAdded: 5 },
  { id: 'user4', name: 'Alice Brown', email: 'alice@example.com', role: 'user', status: 'pending', joinDate: '2024-03-25', treesAdded: 2 },
];

export default function AdminPage() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(true);
  const [editingTree, setEditingTree] = useState<Tree | undefined>(undefined);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ project_name: '', project_address: '', client_name: '', status: 'active' as const });
  const { toast } = useToast();

  const loadTrees = useCallback(() => {
    try {
      const allTrees = TreeService.getAllTrees();
      setTrees(allTrees);
    } catch (error) {
      console.error('Error loading trees:', error);
      toast({
        title: "Error",
        description: "Failed to load trees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadProjects = useCallback(() => {
    try {
      const allProjects = ProjectService.getAllProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    loadTrees();
    loadProjects();
  }, [loadTrees, loadProjects]);

  const handleDeleteTree = (treeId: string, species: string) => {
    if (confirm(`Are you sure you want to delete the ${species} tree? This action cannot be undone.`)) {
      try {
        const success = TreeService.deleteTree(treeId);
        if (success) {
          setTrees(trees.filter(tree => tree.id !== treeId));
          toast({
            title: "Tree Deleted",
            description: `${species} has been removed from the system.`,
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete tree",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error deleting tree:', error);
        toast({
          title: "Error",
          description: "Failed to delete tree",
          variant: "destructive"
        });
      }
    }
  };

  const handleEditTree = (tree: Tree) => {
    setEditingTree(tree);
  };

  const handleTreeAdded = () => {
    loadTrees();
    setEditingTree(undefined);
  };

  const handleUserRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    toast({
      title: "Role Updated",
      description: `User role has been updated to ${newRole}`,
    });
  };

  const handleUserStatusChange = (userId: string, newStatus: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    toast({
      title: "Status Updated",
      description: `User status has been updated to ${newStatus}`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'manual':
        return <Shield size={16} className="text-blue-600" />;
      case 'pending':
        return <Clock size={16} className="text-amber-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown size={16} className="text-purple-600" />;
      case 'curator':
        return <Shield size={16} className="text-blue-600" />;
      case 'user':
        return <User size={16} className="text-green-600" />;
      default:
        return <User size={16} className="text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Unlock size={16} className="text-green-600" />;
      case 'pending':
        return <Clock size={16} className="text-amber-600" />;
      case 'suspended':
        return <Lock size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  // Filter trees based on search and status
  const filteredTrees = trees.filter(tree => {
    const matchesSearch = searchTerm === '' || 
      tree.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tree.commonName && tree.commonName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tree.scientificName && tree.scientificName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || tree.verification_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter users based on role
  const filteredUsers = users.filter(user => 
    userRoleFilter === 'all' || user.role === userRoleFilter
  );

  // Statistics
  const stats = {
    totalTrees: trees.length,
    verifiedTrees: trees.filter(t => t.verification_status === 'verified').length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingTrees: trees.filter(t => t.verification_status === 'pending').length,
    adminUsers: users.filter(u => u.role === 'admin').length
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-green-700 flex items-center gap-2">
            <span className="animate-spin">⚙️</span>
            Loading admin panel...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="text-3xl">⚙️</div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                  <p className="text-gray-600">System management and oversight</p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-3 py-1">
              <Crown size={14} className="mr-1" />
              Administrator Access
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <TreePine size={24} className="mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-800">{stats.totalTrees}</div>
              <div className="text-sm text-green-600">Total Trees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle size={24} className="mx-auto mb-2 text-emerald-600" />
              <div className="text-2xl font-bold text-emerald-800">{stats.verifiedTrees}</div>
              <div className="text-sm text-emerald-600">Verified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock size={24} className="mx-auto mb-2 text-amber-600" />
              <div className="text-2xl font-bold text-amber-800">{stats.pendingTrees}</div>
              <div className="text-sm text-amber-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users size={24} className="mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-800">{stats.totalUsers}</div>
              <div className="text-sm text-blue-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Unlock size={24} className="mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-800">{stats.activeUsers}</div>
              <div className="text-sm text-green-600">Active Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Crown size={24} className="mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-800">{stats.adminUsers}</div>
              <div className="text-sm text-purple-600">Admins</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="trees" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-6">
            <TabsTrigger value="trees" className="flex items-center gap-2">
              <TreePine size={16} />
              Trees
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen size={16} />
              Projects
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users size={16} />
              Users
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings size={16} />
              System
            </TabsTrigger>
          </TabsList>

          {/* Trees Management Tab */}
          <TabsContent value="trees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TreePine size={20} className="text-green-600" />
                    Tree Management ({filteredTrees.length} of {trees.length})
                  </div>
                  <AddTreeModal 
                    onTreeAdded={handleTreeAdded} 
                    editTree={editingTree}
                    isEditMode={!!editingTree}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Controls */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      placeholder="Search trees by species or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <Filter size={16} className="mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">✅ Verified</SelectItem>
                      <SelectItem value="manual">🔵 Manual</SelectItem>
                      <SelectItem value="pending">🟡 Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Trees Table */}
                {filteredTrees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {trees.length === 0 ? 'No trees found in the system.' : 'No trees match your filters.'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tree Details</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrees.map((tree) => (
                        <TableRow key={tree.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-semibold text-green-800">
                                {tree.commonName || tree.species}
                              </div>
                              {tree.scientificName && (
                                <div className="text-sm italic text-green-600">
                                  {tree.scientificName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin size={12} />
                              {tree.lat.toFixed(4)}, {tree.lng.toFixed(4)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {calculateTreeAge(tree.date_planted).displayText}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getVerificationIcon(tree.verification_status)}
                              <span className="text-sm capitalize">
                                {tree.verification_status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(tree.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTree(tree)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Edit size={14} className="mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTree(tree.id, tree.commonName || tree.species)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 size={14} className="mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={20} className="text-blue-600" />
                    User Management ({filteredUsers.length} of {users.length})
                  </div>
                  <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">👑 Admins</SelectItem>
                      <SelectItem value="curator">🛡️ Curators</SelectItem>
                      <SelectItem value="user">👤 Users</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trees Added</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            <Select 
                              value={user.role} 
                              onValueChange={(value) => handleUserRoleChange(user.id, value)}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="curator">Curator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(user.status)}
                            <Select 
                              value={user.status} 
                              onValueChange={(value) => handleUserStatusChange(user.id, value)}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {user.treesAdded} trees
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(user.joinDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Management Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database size={20} className="text-purple-600" />
                    System Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Database Size</span>
                    <Badge variant="secondary">~{(trees.length * 0.5).toFixed(1)} KB</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">API Calls Today</span>
                    <Badge variant="secondary">247</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Storage Used</span>
                    <Badge variant="secondary">2.3 MB</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Uptime</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">99.9%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-green-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">New trees added today</span>
                      <span className="font-semibold">3</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trees verified today</span>
                      <span className="font-semibold">5</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">New user registrations</span>
                      <span className="font-semibold">2</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">System updates</span>
                      <span className="font-semibold">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={20} className="text-gray-600" />
                  System Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Database size={16} className="mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <BarChart3 size={16} className="mr-2" />
                    Export Analytics
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Settings size={16} className="mr-2" />
                    System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}