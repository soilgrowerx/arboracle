'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Users,
  FileText
} from 'lucide-react';

interface NurseryTree {
  id: string;
  species: string;
  scientificName: string;
  size: string;
  price: number;
  stock: number;
  description: string;
  category: string;
  imageUrl?: string;
  addedDate: string;
}

interface QuoteRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  requestDate: string;
  items: {treeId: string; species: string; quantity: number; price: number}[];
  status: 'pending' | 'sent' | 'accepted' | 'declined';
  totalValue: number;
}

// Sample data
const SAMPLE_INVENTORY: NurseryTree[] = [
  {
    id: '1',
    species: 'Red Oak',
    scientificName: 'Quercus rubra',
    size: '2-3" caliper',
    price: 185.00,
    stock: 24,
    description: 'Native shade tree with excellent fall color.',
    category: 'Shade Trees',
    addedDate: '2025-01-15'
  },
  {
    id: '2',
    species: 'Sugar Maple',
    scientificName: 'Acer saccharum',
    size: '1.5-2" caliper',
    price: 165.00,
    stock: 18,
    description: 'Premium maple with spectacular fall colors.',
    category: 'Shade Trees',
    addedDate: '2025-01-10'
  }
];

const SAMPLE_REQUESTS: QuoteRequest[] = [
  {
    id: '1',
    clientName: 'Central Park Landscaping',
    clientEmail: 'orders@centralparklandscaping.com',
    requestDate: '2025-01-20',
    items: [
      {treeId: '1', species: 'Red Oak', quantity: 5, price: 185.00},
      {treeId: '2', species: 'Sugar Maple', quantity: 3, price: 165.00}
    ],
    status: 'pending',
    totalValue: 1420.00
  }
];

export default function NurseryAdminPage() {
  const [inventory, setInventory] = useState<NurseryTree[]>([]);
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddTreeOpen, setIsAddTreeOpen] = useState(false);
  const [editingTree, setEditingTree] = useState<NurseryTree | null>(null);

  useEffect(() => {
    setInventory(SAMPLE_INVENTORY);
    setRequests(SAMPLE_REQUESTS);
  }, []);

  const filteredInventory = inventory.filter(tree =>
    tree.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInventoryValue = inventory.reduce((sum, tree) => sum + (tree.price * tree.stock), 0);
  const lowStockItems = inventory.filter(tree => tree.stock < 10).length;
  const pendingRequests = requests.filter(req => req.status === 'pending').length;

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-green-600 hover:text-green-700">
                ← Back to Admin
              </Link>
              <div className="flex items-center gap-2">
                <Package className="h-8 w-8 text-green-600" />
                <h1 className="text-2xl font-bold text-green-800">Nursery Admin Panel</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/nursery">
                <Button variant="outline">View Public Inventory</Button>
              </Link>
              <Dialog open={isAddTreeOpen} onOpenChange={setIsAddTreeOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tree
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Tree to Inventory</DialogTitle>
                  </DialogHeader>
                  <AddTreeForm onClose={() => setIsAddTreeOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                  <p className="text-2xl font-bold text-green-600">${totalInventoryValue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Species</p>
                  <p className="text-2xl font-bold text-blue-600">{inventory.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                  <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-purple-600">{pendingRequests}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-green-200 p-6 mb-8">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search inventory by species or scientific name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Species</TableHead>
                  <TableHead>Scientific Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map(tree => (
                  <TableRow key={tree.id}>
                    <TableCell className="font-medium">{tree.species}</TableCell>
                    <TableCell className="italic text-gray-600">{tree.scientificName}</TableCell>
                    <TableCell>{tree.size}</TableCell>
                    <TableCell>${tree.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={tree.stock > 20 ? "default" : tree.stock > 5 ? "secondary" : "destructive"}>
                        {tree.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>{tree.category}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quote Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quote Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{request.clientName}</h4>
                      <p className="text-sm text-gray-600">{request.clientEmail}</p>
                      <p className="text-sm text-gray-500">Requested: {request.requestDate}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={request.status === 'pending' ? 'destructive' : 'default'}>
                        {request.status}
                      </Badge>
                      <p className="text-lg font-semibold text-green-600 mt-1">
                        ${request.totalValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {request.items.map((item, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        {item.species} - Qty: {item.quantity} @ ${item.price.toFixed(2)} each
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm">Send Quote</Button>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AddTreeForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    species: '',
    scientificName: '',
    size: '',
    price: '',
    stock: '',
    description: '',
    category: ''
  });

  const categories = ['Shade Trees', 'Ornamental Trees', 'Evergreens', 'Fruit Trees'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would submit to API
    console.log('Adding tree:', formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="species">Species</Label>
          <Input
            id="species"
            value={formData.species}
            onChange={(e) => setFormData({...formData, species: e.target.value})}
            placeholder="e.g., Red Oak"
            required
          />
        </div>
        <div>
          <Label htmlFor="scientificName">Scientific Name</Label>
          <Input
            id="scientificName"
            value={formData.scientificName}
            onChange={(e) => setFormData({...formData, scientificName: e.target.value})}
            placeholder="e.g., Quercus rubra"
            required
          />
        </div>
        <div>
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            value={formData.size}
            onChange={(e) => setFormData({...formData, size: e.target.value})}
            placeholder="e.g., 2-3 inch caliper"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: e.target.value})}
            placeholder="0"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Brief description of the tree..."
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Add Tree
        </Button>
      </div>
    </form>
  );
}