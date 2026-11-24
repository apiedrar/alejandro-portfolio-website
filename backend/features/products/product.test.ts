import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from "supertest";
import express from "express";
import { errorHandler } from '../../shared/errors/error.handler.js';

// Mock the Product model BEFORE importing the routes

const mockFind = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockFindById = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockFindByIdAndUpdate = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockFindByIdAndDelete = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockUpdateMany = jest.fn<(...args: unknown[]) => Promise<unknown>>();

jest.unstable_mockModule('./product.model.js', () => ({
    Product: {
        find: mockFind,
        findById: mockFindById,
        findByIdAndUpdate: mockFindByIdAndUpdate,
        findByIdAndDelete: mockFindByIdAndDelete,
        updateMany: mockUpdateMany,
    }
}));

// Import routes AFTER mocking the model
const { default: productRoutes } = await import('./product.routes.js');

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);
app.use(errorHandler);

const VALID_ID = '64b7f8f2f1d2a8b9c0d1e2f3';

const validProductBody = {
    name: 'Binary Search Tree',
    priceCents: 4999,
    image: '/products/bst.png',
    category: 'Data Structures',
    tags: ['tree'],
    brand: 'ACME DSA',
    specifications: { storage: 'O(n)' },
};

describe('Product API', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        mockUpdateMany.mockResolvedValue({});
    });

    describe('GET /api/products', () => {
        it('should get all products successfully', async () => {
            const mockProducts = [
                { _id: '1', name: 'iPhone 16', priceCents: 69900, image: 'example.com/iphone16.jpg' },
                { _id: '2', name: 'iPhone 17', priceCents: 79900, image: 'example.com/iphone17.jpg' },
            ];
            mockFind.mockResolvedValue(mockProducts);

            const res = await request(app).get('/api/products');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toEqual(mockProducts);
            expect(mockFind).toHaveBeenCalledWith({});
        });

        it('heals depleted stock before reading', async () => {
            mockFind.mockResolvedValue([]);

            await request(app).get('/api/products');

            expect(mockUpdateMany).toHaveBeenCalledTimes(1);
            expect(mockUpdateMany.mock.invocationCallOrder[0]).toBeLessThan(mockFind.mock.invocationCallOrder[0]);
        });

        it('should handle errors when fetching products', async () => {
            mockFind.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/api/products');

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body.error[0]).toHaveProperty('message', 'Something went wrong on our end');
        });
    });

    describe('GET /api/products/:id', () => {
        it('rejects a malformed id with 400 before touching the database', async () => {
            const res = await request(app).get('/api/products/not-an-object-id');

            expect(res.status).toBe(400);
            expect(res.body.error[0]).toMatchObject({ field: 'id', code: 'InvalidParam' });
            expect(mockFindById).not.toHaveBeenCalled();
        });

        it('returns 404 for a well-formed id that does not exist', async () => {
            mockFindById.mockResolvedValue(null);

            const res = await request(app).get(`/api/products/${VALID_ID}`);

            expect(res.status).toBe(404);
            expect(res.body.error[0]).toMatchObject({ field: 'id', code: 'NotFoundError' });
        });

        it('returns the product when it exists', async () => {
            mockFindById.mockResolvedValue({ _id: VALID_ID, name: 'BST' });

            const res = await request(app).get(`/api/products/${VALID_ID}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual({ _id: VALID_ID, name: 'BST' });
        });
    });

    describe('POST /api/products', () => {
        it('rejects an invalid body with 400 and one error item per failing field', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({ name: 'x'.repeat(31), priceCents: 10, category: 'Nope' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);

            const fields = (res.body.error as { field?: string }[]).map(item => item.field);
            expect(fields).toEqual(expect.arrayContaining(['name', 'priceCents', 'category', 'image', 'tags', 'brand', 'specifications']));
        });

        it('rejects a fractional price: money is always integer cents', async () => {
            const res = await request(app).post('/api/products').send({ ...validProductBody, priceCents: 99.5 });

            expect(res.status).toBe(400);
            expect(res.body.error).toHaveLength(1);
            expect(res.body.error[0]).toHaveProperty('field', 'priceCents');
        });

        it('rejects a spec key outside letters, underscore and hyphen', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({ ...validProductBody, specifications: { 'bad key!': 'x' } });

            expect(res.status).toBe(400);
            expect(res.body.error[0].field).toContain('specifications');
        });
    });

    describe('PATCH /api/products/:id', () => {
        it('rejects an empty body with 400 and a field-less error item', async () => {
            const res = await request(app).patch(`/api/products/${VALID_ID}`).send({});

            expect(res.status).toBe(400);
            expect(res.body.error[0]).toMatchObject({ code: 'custom', message: 'At least one field must be provided' });
            expect(res.body.error[0]).not.toHaveProperty('field');
            expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
        });

        it.each([-1, 1.5, 199])('rejects stock %p: it must be an integer from 0 to the 198 ceiling', async (stock) => {
            const res = await request(app).patch(`/api/products/${VALID_ID}`).send({ stock });

            expect(res.status).toBe(400);
            expect(res.body.error[0]).toHaveProperty('field', 'stock');
            expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('validates the id before the body', async () => {
            const res = await request(app).patch('/api/products/not-an-object-id').send({});

            expect(res.status).toBe(400);
            expect(res.body.error[0]).toMatchObject({ field: 'id', code: 'InvalidParam' });
        });

        it('accepts a partial update containing a free-text description', async () => {
            const updated = { _id: VALID_ID, description: 'A perfectly normal description.' };
            mockFindByIdAndUpdate.mockResolvedValue(updated);

            const res = await request(app)
                .patch(`/api/products/${VALID_ID}`)
                .send({ description: 'A perfectly normal description.' });

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual(updated);
            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
                VALID_ID,
                { description: 'A perfectly normal description.' },
                { new: true, runValidators: true },
            );
        });

        it('does not backfill defaults into a partial update', async () => {
            mockFindByIdAndUpdate.mockResolvedValue({ _id: VALID_ID, name: 'Renamed' });

            await request(app).patch(`/api/products/${VALID_ID}`).send({ name: 'Renamed' });

            const [, update] = mockFindByIdAndUpdate.mock.calls[0] as [string, Record<string, unknown>];
            expect(update).toEqual({ name: 'Renamed' });
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('returns 404 when the product does not exist', async () => {
            mockFindByIdAndDelete.mockResolvedValue(null);

            const res = await request(app).delete(`/api/products/${VALID_ID}`);

            expect(res.status).toBe(404);
        });

        it('returns the deleted product on success', async () => {
            mockFindByIdAndDelete.mockResolvedValue({ _id: VALID_ID, name: 'BST' });

            const res = await request(app).delete(`/api/products/${VALID_ID}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toEqual({ _id: VALID_ID, name: 'BST' });
        });
    });
});
