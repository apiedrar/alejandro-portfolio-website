import mongoose from "mongoose";

export enum OrderStatus {
    pending_payment = "pending_payment",
    paid = "paid",
    fulfilled = "fulfilled",
    expired = "expired",
    canceled = "canceled",
    paid_unfulfillable = "paid_unfulfillable",
};
export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    productName: string;
    unitPriceCents: number;
    quantity: number;
    subtotalCents: number;
};
export interface IOrder {
    orderNumber: string;
    tokenHash: string;
    customerName: string;
    items: IOrderItem[];
    totalCents: number;
    currency: 'usd';
    status: OrderStatus;
    reservationExpiresAt: Date;
};

const orderSchema = new mongoose.Schema<IOrder>({
    orderNumber: { // "APR-20260101-0001" (unique)
        type: String,
        unique: true,
        required: true
    },
    tokenHash: { // SHA-256 of the retrieval token. Unique index. Plaintext never stored.
        type: String,
        unique: true,
        required: true,
    },
    customerName: { // Fixed "John Doe"
        type: String,
        required: true,
    },
    items: [{
        productId: { // Reference to Product._id
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        productName: { // "Product Name" snapshot at purchase time
            type: String,
            required: true,
        },
        unitPriceCents: { // "priceCents" at purchase time
            type: Number,
            required: true,
        },
        quantity: { // 1 or 2 or X
            type: Number,
            required: true,
        },
        subtotalCents: { // price * quantity
            type: Number,
            required: true,
        },
    }],
    totalCents: { // sum of all subtotalCents
        type: Number,
        required: true,
    },
    currency: { // 'usd' literal for forward compatibility
        type: String,
        enum: ['usd'],
        required: true,
        default: 'usd',
    },
    status: { // "pending_payment", "paid", "fulfilled", "expired", "canceled", "paid_unfulfillable"
        type: String,
        enum: OrderStatus,
        default: OrderStatus.pending_payment,
        required: true,
    },
    reservationExpiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true // createdAt, updatedAt
});

// must stay > reservation window, set in task 9
const ORDER_RETENTION_SECONDS: number = 432000;

orderSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: ORDER_RETENTION_SECONDS,
        partialFilterExpression: {
            status: { $in: [OrderStatus.pending_payment, OrderStatus.expired, OrderStatus.canceled] },
        },
    }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);