'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ShoppingCart, Package, DollarSign, Ruler } from 'lucide-react';

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
}

// Sample nursery inventory data
const SAMPLE_INVENTORY: NurseryTree[] = [
  {
    id: '1',
    species: 'Red Oak',
    scientificName: 'Quercus rubra',
    size: '2-3" caliper',
    price: 185.00,
    stock: 24,
    description: 'Native shade tree with excellent fall color. Drought tolerant once established.',
    category: 'Shade Trees',
    imageUrl: '/trees/red-oak.jpg'
  },
  {
    id: '2',
    species: 'Sugar Maple',
    scientificName: 'Acer saccharum',
    size: '1.5-2" caliper',
    price: 165.00,
    stock: 18,
    description: 'Premium maple with spectacular fall colors. Perfect for streets and parks.',
    category: 'Shade Trees'
  },
  {
    id: '3',
    species: 'Eastern Redbud',
    scientificName: 'Cercis canadensis',
    size: '6-8 feet',
    price: 95.00,
    stock: 32,
    description: 'Beautiful spring flowering tree with heart-shaped leaves.',
    category: 'Ornamental Trees'
  },
  {
    id: '4',
    species: 'White Pine',
    scientificName: 'Pinus strobus',
    size: '5-6 feet',
    price: 75.00,
    stock: 45,
    description: 'Fast-growing evergreen excellent for windbreaks and privacy.',
    category: 'Evergreens'
  },
  {
    id: '5',
    species: 'Flowering Dogwood',
    scientificName: 'Cornus florida',
    size: '4-5 feet',
    price: 125.00,
    stock: 15,
    description: 'Iconic spring bloomer with four-season interest.',
    category: 'Ornamental Trees'
  }
];

export default function NurseryInventoryPage() {
  const [inventory, setInventory] = useState<NurseryTree[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [cartItems, setCartItems] = useState<{[key: string]: number}>({});

  useEffect(() => {
    // Load inventory (in real app, this would be from API)
    setInventory(SAMPLE_INVENTORY);
  }, []);

  const categories = ['all', 'Shade Trees', 'Ornamental Trees', 'Evergreens', 'Fruit Trees'];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-100', label: '$0 - $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200+', label: '$200+' }
  ];

  const filteredInventory = inventory.filter(tree => {
    const matchesSearch = tree.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tree.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tree.category === selectedCategory;
    
    let matchesPrice = true;
    if (priceFilter === '0-100') matchesPrice = tree.price <= 100;
    else if (priceFilter === '100-200') matchesPrice = tree.price > 100 && tree.price <= 200;
    else if (priceFilter === '200+') matchesPrice = tree.price > 200;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const addToCart = (treeId: string) => {
    setCartItems(prev => ({
      ...prev,
      [treeId]: (prev[treeId] || 0) + 1
    }));
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-green-600 hover:text-green-700">
                ← Back to Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <Package className="h-8 w-8 text-green-600" />
                <h1 className="text-2xl font-bold text-green-800">Tree Nursery Inventory</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Request Quote
                {getTotalCartItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {getTotalCartItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-green-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by species or scientific name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map(tree => (
            <Card key={tree.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-green-800">{tree.species}</CardTitle>
                    <p className="text-sm text-gray-600 italic">{tree.scientificName}</p>
                  </div>
                  <Badge variant={tree.stock > 20 ? "default" : tree.stock > 5 ? "secondary" : "destructive"}>
                    {tree.stock} in stock
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Ruler className="h-4 w-4" />
                    <span>{tree.size}</span>
                  </div>
                  <p className="text-sm text-gray-700">{tree.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-semibold text-green-700">{tree.price.toFixed(2)}</span>
                    </div>
                    <Button 
                      onClick={() => addToCart(tree.id)}
                      disabled={tree.stock === 0}
                      size="sm"
                    >
                      Add to Quote
                    </Button>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {tree.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trees found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}