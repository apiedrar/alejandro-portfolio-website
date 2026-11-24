import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { Product, type IProduct } from './product.model.js';
import { restockDepletedProducts } from './product.stock.js';
import { getAllProducts, getSingleProductById } from './product.service.js';
import { DEFAULT_STOCK, RESTOCK_DELAY_MS } from './products.constants.js';
import { startMongo, stopMongo, clearDatabase, STARTUP_TIMEOUT_MS } from '../../shared/testing/mongo.harness.js';

const DEPLETED_AT = new Date('2026-01-01T00:00:00.000Z');

function buildProduct(overrides: Partial<IProduct> = {}): IProduct {
    return {
        name: 'Binary Search Tree',
        priceCents: 4999,
        image: '/products/bst.png',
        category: 'Data Structures',
        tags: ['tree'],
        brand: 'ACME DSA',
        specifications: new Map([['storage', 'O(n)']]),
        onSale: false,
        isActive: true,
        stock: DEFAULT_STOCK,
        depletedAt: null,
        ...overrides,
    };
}

async function snapshot(id: unknown) {
    const doc = await Product.findById(id).lean();
    return { stock: doc?.stock, depletedAt: doc?.depletedAt };
}

describe('Lazy-reset gate (real MongoDB)', () => {
    beforeAll(startMongo, STARTUP_TIMEOUT_MS);
    afterAll(stopMongo, STARTUP_TIMEOUT_MS);
    beforeEach(clearDatabase);

    it('does not heal one millisecond before the delay has elapsed', async () => {
        const product = await Product.create(buildProduct({ stock: 0, depletedAt: DEPLETED_AT }));

        await restockDepletedProducts(new Date(DEPLETED_AT.getTime() + RESTOCK_DELAY_MS - 1));

        expect(await snapshot(product._id)).toEqual({ stock: 0, depletedAt: DEPLETED_AT });
    });

    it('heals exactly when the delay has elapsed, and clears depletedAt', async () => {
        const product = await Product.create(buildProduct({ stock: 0, depletedAt: DEPLETED_AT }));

        await restockDepletedProducts(new Date(DEPLETED_AT.getTime() + RESTOCK_DELAY_MS));

        expect(await snapshot(product._id)).toEqual({ stock: DEFAULT_STOCK, depletedAt: null });
    });

    it('never restocks a product an operator zeroed on purpose (no depletedAt)', async () => {
        const product = await Product.create(buildProduct({ stock: 0, depletedAt: null }));

        await restockDepletedProducts(new Date(DEPLETED_AT.getTime() + 10 * RESTOCK_DELAY_MS));

        expect(await snapshot(product._id)).toEqual({ stock: 0, depletedAt: null });
    });

    it('does not clobber a manual restock that left a stale depletedAt', async () => {
        const product = await Product.create(buildProduct({ stock: 50, depletedAt: DEPLETED_AT }));

        await restockDepletedProducts(new Date(DEPLETED_AT.getTime() + 10 * RESTOCK_DELAY_MS));

        expect(await snapshot(product._id)).toEqual({ stock: 50, depletedAt: DEPLETED_AT });
    });

    it('heals only the eligible products in a mixed catalog', async () => {
        const eligible = await Product.create(buildProduct({ name: 'eligible', stock: 0, depletedAt: DEPLETED_AT }));
        const tooRecent = await Product.create(
            buildProduct({ name: 'too recent', stock: 0, depletedAt: new Date(DEPLETED_AT.getTime() + 10_000) }),
        );
        const inStock = await Product.create(buildProduct({ name: 'in stock', stock: 7 }));

        await restockDepletedProducts(new Date(DEPLETED_AT.getTime() + RESTOCK_DELAY_MS));

        expect((await snapshot(eligible._id)).stock).toBe(DEFAULT_STOCK);
        expect((await snapshot(tooRecent._id)).stock).toBe(0);
        expect((await snapshot(inStock._id)).stock).toBe(7);
    });

    it('is safe under concurrent callers: the end state is the same as a single heal', async () => {
        const product = await Product.create(buildProduct({ stock: 0, depletedAt: DEPLETED_AT }));
        const now = new Date(DEPLETED_AT.getTime() + RESTOCK_DELAY_MS);

        await Promise.all(Array.from({ length: 10 }, () => restockDepletedProducts(now)));

        expect(await snapshot(product._id)).toEqual({ stock: DEFAULT_STOCK, depletedAt: null });
    });

    describe('through the service read paths (real clock)', () => {
        const longAgo = () => new Date(Date.now() - RESTOCK_DELAY_MS - 1_000);

        it('getSingleProductById returns an already-healed product', async () => {
            const product = await Product.create(buildProduct({ stock: 0, depletedAt: longAgo() }));

            const result = await getSingleProductById(String(product._id));

            expect(result.stock).toBe(DEFAULT_STOCK);
            expect(result.depletedAt).toBeNull();
        });

        it('getAllProducts returns healed products and leaves recent depletions alone', async () => {
            await Product.create(buildProduct({ name: 'old', stock: 0, depletedAt: longAgo() }));
            await Product.create(buildProduct({ name: 'fresh', stock: 0, depletedAt: new Date() }));

            const products = await getAllProducts();
            const byName = Object.fromEntries(products.map((p) => [p.name, p.stock]));

            expect(byName).toEqual({ old: DEFAULT_STOCK, fresh: 0 });
        });
    });
});
