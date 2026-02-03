'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../Navbar';
import { useCartStore } from '@/stores/cartStore';
import { ShoppingCartIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import '../shop.css';

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
    brand?: string;
    category?: string;
    stock?: number;
    specifications?: {
        storage?: string;
        color?: string;
        ram?: string;
    };
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    const addToCart = useCartStore((state) => state.addToCart);

    useEffect(() => {
        if (params.id) {
            fetchProduct(params.id as string);
        }
    }, [params.id]);

    const fetchProduct = async (id: string) => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9999';
            const response = await fetch(`${apiUrl}/api/products/${id}`);
            const data = await response.json();

            if (data.success) {
                setProduct(data.data);
            } else {
                setError('Product not found');
            }
        } catch (err) {
            setError('Failed to load product');
            console.error('Error fetching product:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen shop-container">
                <Navbar />
                <div className="product-detail">
                    <div className="skeleton" style={{ height: '400px', borderRadius: '1rem' }} />
                    <div className="product-detail-info">
                        <div className="skeleton" style={{ height: '40px', marginBottom: '1rem' }} />
                        <div className="skeleton" style={{ height: '32px', width: '40%', marginBottom: '1rem' }} />
                        <div className="skeleton" style={{ height: '100px', marginBottom: '1rem' }} />
                        <div className="skeleton" style={{ height: '50px' }} />
                    </div>
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="min-h-screen shop-container">
                <Navbar />
                <div className="empty-state" style={{ paddingTop: '10rem' }}>
                    <p className="empty-state-title">Product Not Found</p>
                    <p className="empty-state-text">{error || 'This product does not exist.'}</p>
                    <button
                        onClick={() => router.push('/shop')}
                        className="shop-btn shop-btn-primary"
                        style={{ width: 'auto' }}
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to Shop
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen shop-container">
            <Navbar />

            <div className="product-detail">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="mb-4 flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back
                    </button>
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={600}
                        height={500}
                        className="product-detail-image"
                        priority
                    />
                </div>

                <div className="product-detail-info">
                    {product.brand && (
                        <p className="text-sm opacity-70 uppercase tracking-wider">{product.brand}</p>
                    )}
                    <h1 className="product-detail-title">{product.name}</h1>
                    <p className="product-detail-price">{formatPrice(product.price)}</p>

                    {product.stock !== undefined && (
                        <p className={`stock-indicator ${product.stock > 10 ? 'in-stock' :
                            product.stock > 0 ? 'low-stock' : 'out-of-stock'
                            }`}>
                            {product.stock > 10 ? '✓ In Stock' :
                                product.stock > 0 ? `Only ${product.stock} left in stock` : 'Out of Stock'}
                        </p>
                    )}

                    {product.description && (
                        <p className="product-detail-description">{product.description}</p>
                    )}

                    {product.specifications && Object.keys(product.specifications).length > 0 && (
                        <div className="product-specs">
                            <h4>Specifications</h4>
                            <div className="product-specs-list">
                                {product.specifications.storage && (
                                    <div className="product-specs-item">
                                        <span className="product-specs-label">Storage:</span>
                                        <span>{product.specifications.storage}</span>
                                    </div>
                                )}
                                {product.specifications.ram && (
                                    <div className="product-specs-item">
                                        <span className="product-specs-label">RAM:</span>
                                        <span>{product.specifications.ram}</span>
                                    </div>
                                )}
                                {product.specifications.color && (
                                    <div className="product-specs-item">
                                        <span className="product-specs-label">Color:</span>
                                        <span>{product.specifications.color}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4 mt-4">
                        <label className="flex items-center gap-2">
                            <span>Qty:</span>
                            <input
                                type="number"
                                min="1"
                                max={product.stock || 99}
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="quantity-input"
                            />
                        </label>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className={`shop-btn mt-4 ${addedToCart ? 'shop-btn-secondary' : 'shop-btn-primary'}`}
                        disabled={product.stock === 0}
                    >
                        <ShoppingCartIcon className="w-5 h-5" />
                        {addedToCart ? 'Added to Cart ✓' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </main>
    );
}
