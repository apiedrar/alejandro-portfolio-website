import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(persist((set, get) => ({
    // Cart State
    items: [],

    // Cart Actions
    addToCart: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product._id);

        if (existingItem) {
            // Update quantity if item already exists
            set({
                items: items.map(item => item.id === product._id ? {
                    ...item,
                    quantity: item.quantity + quantity
                } : item)
            })
        } else {
            // Add new item to cart
            set({
                items: [...items, { id: product._id, name: product.name, price: product.price, image: product.image, quantity }]
            });
        }

    },

    removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) });
    },

    updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(productId);
            return;
        }
        set({
            items: get().items.map(item => item.id === productId ? {
                ...item,
                quantity
            } : item),
        });
    },

    clearCart: () => set({ items: [] }),

    // Computed values
    getOrderTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
    },

    getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    },
}),
    // local storage key
    { name: 'cart-storage', }
)
);