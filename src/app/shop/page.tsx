'use client';

import { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { ProductCard, DemoDisclaimerModal } from '@/components/shop';
import './shop.css';

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    brand?: string;
    category?: string;
    stock?: number;
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showDisclaimer, setShowDisclaimer] = useState(false);

    useEffect(() => {
        if (!sessionStorage.getItem('shop_guest_acknowledged')) {
            setShowDisclaimer(true);
        }
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/products`);
            const data = await response.json();

            if (data.success) {
                setProducts(data.data);
            } else {
                setError('Failed to load products');
            }
        } catch (err) {
            setError('Failed to connect to server');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['all', ...new Set(products.map(p => p.category).filter((c): c is string => Boolean(c)))];

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category === selectedCategory);

    return (
        <main className="min-h-screen shop-container">
            {showDisclaimer && (
                <DemoDisclaimerModal onClose={() => setShowDisclaimer(false)} />
            )}
            <Navbar />

            <header className="shop-header">
                <h1 className="shop-title">Sandbox Shop</h1>
                <p className="shop-subtitle">
                    A demo e-commerce experience. Browse products, add to cart, and checkout with Stripe test mode.
                </p>
            </header>

            {/* Category Filter */}
            {categories.length > 1 && (
                <div className="flex justify-center gap-2 mb-6 px-4 flex-wrap">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                ? 'bg-[#624094] text-white'
                                : 'bg-transparent border border-[#cabfdb] hover:bg-[#cabfdb]/10'
                                }`}
                        >
                            {category === 'all' ? 'All Products' : category}
                        </button>
                    ))}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="product-grid">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="product-card">
                            <div className="skeleton" style={{ height: '200px' }} />
                            <div className="product-card-content">
                                <div className="skeleton" style={{ height: '20px', marginBottom: '0.5rem' }} />
                                <div className="skeleton" style={{ height: '28px', width: '60%', marginBottom: '0.75rem' }} />
                                <div className="skeleton" style={{ height: '44px' }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="empty-state">
                    <p className="empty-state-title">Oops!</p>
                    <p className="empty-state-text">{error}</p>
                    <button onClick={fetchProducts} className="shop-btn shop-btn-primary" style={{ width: 'auto' }}>
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredProducts.length === 0 && (
                <div className="empty-state">
                    <p className="empty-state-title">No Products Found</p>
                    <p className="empty-state-text">
                        {selectedCategory !== 'all'
                            ? `No products in the "${selectedCategory}" category.`
                            : 'Check back soon for new products!'}
                    </p>
                </div>
            )}

            {/* Product Grid */}
            {!loading && !error && filteredProducts.length > 0 && (
                <div className="product-grid">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </main>
    );
}
