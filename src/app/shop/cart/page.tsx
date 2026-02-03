'use client';

import Link from 'next/link';
import Navbar from '../../Navbar';
import { useCartStore } from '@/stores/cartStore';
import { CartItem } from '@/components/shop';
import { ShoppingBagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import '../shop.css';

export default function CartPage() {
    const items = useCartStore((state) => state.items);
    const clearCart = useCartStore((state) => state.clearCart);
    const getOrderTotal = useCartStore((state) => state.getOrderTotal);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const total = getOrderTotal();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <main className="min-h-screen shop-container">
            <Navbar />

            <div className="cart-container" style={{ paddingTop: '8rem' }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="shop-title" style={{ textAlign: 'left', paddingTop: 0, paddingBottom: 0 }}>
                            Shopping Cart
                        </h1>
                        <p className="opacity-70">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>
                    <Link
                        href="/shop"
                        className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Continue Shopping
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingBagIcon className="empty-state-icon" />
                        <p className="empty-state-title">Your Cart is Empty</p>
                        <p className="empty-state-text">
                            Looks like you haven&apos;t added any items to your cart yet.
                        </p>
                        <Link href="/shop" className="shop-btn shop-btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {items.map((item) => (
                                <CartItem key={item.id} item={item} />
                            ))}
                        </div>

                        <div className="cart-summary">
                            <div className="cart-summary-row">
                                <span>Subtotal</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <div className="cart-summary-row">
                                <span>Shipping</span>
                                <span className="text-green-500">Free</span>
                            </div>
                            <div className="cart-summary-row cart-summary-total">
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={clearCart}
                                    className="shop-btn shop-btn-secondary"
                                >
                                    Clear Cart
                                </button>
                                <Link
                                    href="/shop/checkout"
                                    className="shop-btn shop-btn-primary"
                                >
                                    Proceed to Checkout
                                </Link>
                            </div>
                        </div>

                        <p className="text-center text-sm opacity-60 mt-6">
                            🔒 This is a demo shop using Stripe test mode. No real payments will be processed.
                        </p>
                    </>
                )}
            </div>
        </main>
    );
}
