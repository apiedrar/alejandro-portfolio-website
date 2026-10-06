'use client';
import Image from 'next/image';
import { useCartStore } from '@/stores/cartStore';
import { TrashIcon } from '@heroicons/react/24/outline';

interface CartItemType {
    id: string;
    name: string;
    priceCents: number;
    image: string;
    quantity: number;
}

interface CartItemProps {
    item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);

    const formatPrice = (priceCents: number) => {
        const displayPrice = parseFloat((priceCents / 100).toFixed(2));
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(displayPrice);
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = parseInt(e.target.value) || 0;
        updateQuantity(item.id, newQuantity);
    };

    return (
        <div className="cart-item">
            <Image
                src={item.image}
                alt={item.name}
                width={100}
                height={100}
                className="cart-item-image"
            />
            <div className="cart-item-details">
                <h3 className="cart-item-title">{item.name}</h3>
                <p className="cart-item-price">{formatPrice(item.priceCents)}</p>
                <div className="cart-item-actions">
                    <label className="flex items-center gap-2">
                        <span className="text-sm opacity-70">Qty:</span>
                        <input
                            type="number"
                            min="1"
                            max="99"
                            value={item.quantity}
                            onChange={handleQuantityChange}
                            className="quantity-input"
                        />
                    </label>
                    <button
                        onClick={() => removeItem(item.id)}
                        className="shop-btn shop-btn-danger"
                        style={{ width: 'auto', padding: '0.5rem 1rem' }}
                    >
                        <TrashIcon className="w-4 h-4" />
                        Remove
                    </button>
                </div>
                <p className="text-sm opacity-70">
                    Subtotal: {formatPrice(item.priceCents * item.quantity)}
                </p>
            </div>
        </div>
    );
}
