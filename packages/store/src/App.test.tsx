import { describe, expect, it } from 'bun:test';
import { renderToString } from 'react-dom/server';
import { App, createAppRouter } from '@/App';

describe('Store App Component with TanStack Router', () => {
	it('renders store catalog route without crashing', async () => {
		const testRouter = createAppRouter('/store/');
		await testRouter.load();
		const html = renderToString(<App router={testRouter} />);

		expect(html).toContain('Store Micro-Frontend');
		expect(html).toContain('@app/store');
		expect(html).toContain('Store Catalog');
		expect(html).toContain('Bun 1.4 Native Hoodie');
	});

	it('renders cart route without crashing', async () => {
		const testRouter = createAppRouter('/store/cart');
		await testRouter.load();
		const html = renderToString(<App router={testRouter} />);

		expect(html).toContain('Shopping Cart &amp; Checkout');
		expect(html).toContain('Estimated Tax');
	});

	it('renders flash deals route without crashing', async () => {
		const testRouter = createAppRouter('/store/deals');
		await testRouter.load();
		const html = renderToString(<App router={testRouter} />);

		expect(html).toContain('Flash Deals &amp; Coupons');
		expect(html).toContain('BUN14FAST');
	});

	it('renders store 404 handler on unmatched route', async () => {
		const testRouter = createAppRouter('/store/missing-item');
		await testRouter.load();
		const html = renderToString(<App router={testRouter} />);

		expect(html).toContain('404: Page Not Found');
		expect(html).toContain('Store MFE 404 Handler');
		expect(html).toContain('Return to Store Catalog');
	});
});
