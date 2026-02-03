'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    brand?: string;
    stock?: number;
}

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const addToCart = useCartStore((state) => state.addToCart);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <Link href={`/shop/${product._id}`} className="product-card">
            <div className="relative">
                <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={200}
                    className="product-card-image"
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div className="product-card-content">
                {product.brand && (
                    <p className="product-card-brand">{product.brand}</p>
                )}
                <h3 className="product-card-title">{product.name}</h3>
                <p className="product-card-price">{formatPrice(product.price)}</p>

                {product.stock !== undefined && (
                    <p className={`stock-indicator ${product.stock > 10 ? 'in-stock' :
                            product.stock > 0 ? 'low-stock' : 'out-of-stock'
                        }`}>
                        {product.stock > 10 ? '✓ In Stock' :
                            product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                    </p>
                )}

                <button
                    onClick={handleAddToCart}
                    className="shop-btn shop-btn-primary mt-3"
                    disabled={product.stock === 0}
                >
                    <ShoppingCartIcon className="w-5 h-5" />
                    Add to Cart
                </button>
            </div>
        </Link>
    );
}
