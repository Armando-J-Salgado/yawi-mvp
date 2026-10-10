import { describe, it, expect } from 'vitest';
import { getProducts, getProductById } from './products.api';

describe('products.api (adaptador mock)', () => {
  it('returns a non-empty list of product DTOs with the expected shape', async () => {
    const products = await getProducts();

    expect(products.length).toBeGreaterThan(0);
    const first = products[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('business_id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('tags');
    expect(first).toHaveProperty('image_urls');
    expect(first).toHaveProperty('price');
    expect(typeof first.price).toBe('number');
  });

  it('returns the DTO for an existing id', async () => {
    const list = await getProducts();
    const target = list[0];

    const found = await getProductById(target.id);

    expect(found.id).toBe(target.id);
    expect(found.name).toBe(target.name);
  });

  it('rejects for an unknown id', async () => {
    await expect(getProductById('does-not-exist')).rejects.toThrow();
  });
});
