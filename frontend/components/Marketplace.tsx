'use client';

import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: 'mortgage' | 'insurance' | 'home-services' | 'financial';
  provider: string;
  rating: number;
  reviews: number;
  price?: string;
  features: string[];
  description: string;
  badge?: string;
  cta: string;
}

const marketplaceProducts: Product[] = [
  {
    id: 'mortgage-1',
    name: '30-Year Fixed Mortgage',
    category: 'mortgage',
    provider: 'Prime Lending',
    rating: 4.8,
    reviews: 1247,
    price: '6.25% APR',
    features: ['No PMI with 20% down', 'Rate lock guarantee', 'Fast pre-approval'],
    description: 'Competitive rates for qualified buyers with excellent credit',
    badge: 'Most Popular',
    cta: 'Get Pre-Approved'
  },
  {
    id: 'mortgage-2',
    name: 'FHA Loan Program',
    category: 'mortgage',
    provider: 'First Home Bank',
    rating: 4.6,
    reviews: 892,
    price: '6.5% APR',
    features: ['3.5% down payment', 'Lower credit requirements', 'First-time buyer friendly'],
    description: 'Perfect for first-time homebuyers with limited down payment',
    cta: 'Learn More'
  },
  {
    id: 'insurance-1',
    name: 'Homeowners Insurance',
    category: 'insurance',
    provider: 'SecureHome Insurance',
    rating: 4.7,
    reviews: 2156,
    price: '$1,200/year',
    features: ['Comprehensive coverage', '24/7 claims support', 'Bundle discounts'],
    description: 'Protect your investment with comprehensive coverage',
    cta: 'Get Quote'
  },
  {
    id: 'insurance-2',
    name: 'Title Insurance',
    category: 'insurance',
    provider: 'TitleGuard',
    rating: 4.9,
    reviews: 543,
    price: 'From $500',
    features: ['One-time payment', 'Lender & owner coverage', 'Fast processing'],
    description: 'Essential protection for your property title',
    cta: 'Get Quote'
  },
  {
    id: 'service-1',
    name: 'Home Inspection',
    category: 'home-services',
    provider: 'Thorough Inspections',
    rating: 4.8,
    reviews: 1834,
    price: '$400-$600',
    features: ['Certified inspectors', 'Same-day reports', 'Free re-inspection'],
    description: 'Professional home inspection before purchase',
    cta: 'Book Inspection'
  },
  {
    id: 'service-2',
    name: 'Moving Services',
    category: 'home-services',
    provider: 'EasyMove',
    rating: 4.5,
    reviews: 967,
    price: 'From $800',
    features: ['Full-service moving', 'Insurance included', 'Flexible scheduling'],
    description: 'Stress-free moving with professional movers',
    cta: 'Get Estimate'
  },
  {
    id: 'financial-1',
    name: 'High-Yield Savings',
    category: 'financial',
    provider: 'Growth Bank',
    rating: 4.7,
    reviews: 3421,
    price: '4.5% APY',
    features: ['No minimum balance', 'FDIC insured', 'Easy transfers'],
    description: 'Maximize your down payment savings',
    badge: 'Best Rate',
    cta: 'Open Account'
  },
  {
    id: 'financial-2',
    name: 'Investment Account',
    category: 'financial',
    provider: 'WealthBuilder',
    rating: 4.6,
    reviews: 1892,
    price: '0.25% fee',
    features: ['Automated investing', 'Low fees', 'Tax-advantaged options'],
    description: 'Grow your wealth beyond homeownership',
    cta: 'Start Investing'
  }
];

export function Marketplace({ filterCategory }: { filterCategory?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>(filterCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Products', icon: '🏪' },
    { id: 'mortgage', name: 'Mortgages', icon: '🏠' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️' },
    { id: 'home-services', name: 'Home Services', icon: '🔧' },
    { id: 'financial', name: 'Financial', icon: '💰' }
  ];

  const filteredProducts = marketplaceProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryColors = {
    mortgage: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    insurance: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    'home-services': 'from-green-500/20 to-green-600/10 border-green-500/30',
    financial: 'from-purple-500/20 to-purple-600/10 border-purple-500/30'
  };

  return (
    <div className="mt-4 p-6 bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Product Marketplace</h3>
        <p className="text-xs text-muted-foreground">Curated products and services for your homeownership journey</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/30 text-foreground hover:bg-muted/50 border border-border'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`p-4 bg-gradient-to-br ${categoryColors[product.category]} border rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground text-sm">{product.name}</h4>
                  {product.badge && (
                    <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                      {product.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{product.provider}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-xs font-semibold text-foreground">{product.rating}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  ({product.reviews.toLocaleString()} reviews)
                </div>
              </div>
            </div>

            {product.price && (
              <div className="mb-2">
                <span className="text-lg font-bold text-foreground">{product.price}</span>
              </div>
            )}

            <p className="text-xs text-muted-foreground mb-3">{product.description}</p>

            <div className="space-y-1 mb-3">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-foreground">
                  <span className="text-green-400">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button className="w-full px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors">
              {product.cta}
            </button>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">No products found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

