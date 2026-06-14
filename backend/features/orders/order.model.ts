import mongoose from "mongoose";

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface IOrder {
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    items: IOrderItem[];
    totalAmount: number;
    status: 'pending' | 'paid' | 'completed' | 'failed';
    stripeSessionId: string;
    stripePaymentIntentId?: string;
}

const orderSchema = new mongoose.Schema<IOrder>({
    orderNumber: { // "APR-20260101-0001" (unique)
        type: String,
        unique: true,
        required: true
    },
    customerEmail: { // "john@example.com"
        type: String,
        required: true,
    },
    customerName: { // "John Doe"
        type: String,
        required: true,
    },
    items: [{
        productId: { // Reference to Product._id
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        productName: { // "Product Name" snapshot at purchase time
            type: String,
            required: true,
        },
        price: { // "Price" at purchase time
            type: Number,
            required: true,
        },
        quantity: { // 1 or 2, etc
            type: Number,
            required: true,
        },
        subtotal: { // price * quantity
            type: Number,
            required: true,
        },
    }],
    totalAmount: { // sum of all subtotals
        type: Number,
        required: true,
    },
    status: { // "pending", "paid", "completed", "failed"
        type: String,
        enum: ['pending', 'paid', 'completed', 'failed'],
        default: 'pending',
        required: true,
    },
    stripeSessionId: { // Reference to Stripe Checkout Session ID
        type: String,
        required: true,
    },
    stripePaymentIntentId: { // Reference to Stripe Payment Intent ID
        type: String,
    },
}, {
    timestamps: true // createdAt, updatedAt
});

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
