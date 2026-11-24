import { jest, describe, it, expect, afterEach } from '@jest/globals';
import { DEFAULT_STOCK, RESTOCK_DELAY_MS } from './products.constants.js';

const mockUpdateMany = jest.fn<(...args: unknown[]) => Promise<unknown>>();

jest.unstable_mockModule('./product.model.js', () => ({
    Product: { updateMany: mockUpdateMany },
}));

const { restockDepletedProducts } = await import('./product.stock.js');

describe('restockDepletedProducts', () => {
    afterEach(() => {
        jest.resetAllMocks();
        jest.useRealTimers();
    });

    it('targets only zero-stock products depleted at or before (now - delay), and resets them', async () => {
        mockUpdateMany.mockResolvedValue({});
        const now = new Date('2026-01-01T00:01:00.000Z');

        await restockDepletedProducts(now);

        expect(mockUpdateMany).toHaveBeenCalledTimes(1);
        expect(mockUpdateMany).toHaveBeenCalledWith(
            { stock: 0, depletedAt: { $lte: new Date(now.getTime() - RESTOCK_DELAY_MS) } },
            { $set: { stock: DEFAULT_STOCK, depletedAt: null } },
        );
    });

    it('derives the cutoff from the injected clock, not from real time', async () => {
        mockUpdateMany.mockResolvedValue({});
        const now = new Date('2030-06-15T12:00:25.000Z');

        await restockDepletedProducts(now);

        const [filter] = mockUpdateMany.mock.calls[0] as [{ depletedAt: { $lte: Date } }];
        expect(filter.depletedAt.$lte.toISOString()).toBe('2030-06-15T12:00:00.000Z');
    });

    it('falls back to the real clock when none is injected', async () => {
        jest.useFakeTimers({ now: new Date('2026-03-01T00:00:30.000Z') });
        mockUpdateMany.mockResolvedValue({});

        await restockDepletedProducts();

        const [filter] = mockUpdateMany.mock.calls[0] as [{ depletedAt: { $lte: Date } }];
        expect(filter.depletedAt.$lte.toISOString()).toBe('2026-03-01T00:00:05.000Z');
    });

    it('lets a database failure propagate instead of swallowing it', async () => {
        mockUpdateMany.mockRejectedValue(new Error('db down'));

        await expect(restockDepletedProducts()).rejects.toThrow('db down');
    });
});
