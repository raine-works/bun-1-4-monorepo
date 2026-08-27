import { describe, expect, it } from 'bun:test';
import { renderToString } from 'react-dom/server';
import { App, createAppRouter } from '@/App';

describe('Hub App Component with TanStack Router', () => {
	it('renders dashboard route without crashing using React 19 server renderer', async () => {
		const testRouter = createAppRouter('/');
		await testRouter.load();
		const html = renderToString(<App router={testRouter} />);

		expect(html).toContain('Hub Micro-Frontend');
		expect(html).toContain('@app/hub');
		expect(html).toContain('Global MFEs');
		expect(html).toContain('Hub SPA');
		expect(html).toContain('System &amp; Runtime Overview');
	});

	it('renders tasks route without crashing', async () => {
		const testRouter = createAppRouter('/tasks');
		await testRouter.load();
		const html = renderToString(<App router={testRouter} />);

		expect(html).toContain('Tasks Manager');
		expect(html).toContain('/api/items');
	});

	it('renders about/architecture route without crashing', async () => {
		const testRouter = createAppRouter('/about');
		await testRouter.load();
		const html = renderToString(<App router={testRouter} />);

		expect(html).toContain('Architecture &amp; Routing Topology');
		expect(html).toContain('Inter-MFE Routing');
	});

	it('renders global 404 handler on unmatched route', async () => {
		const testRouter = createAppRouter('/non-existent-route');
		await testRouter.load();
		const html = renderToString(<App router={testRouter} />);

		expect(html).toContain('404: Page Not Found');
		expect(html).toContain('Global Frontend 404 Handler');
		expect(html).toContain('/non-existent-route');
		expect(html).toContain('Return to Hub Home');
	});
});
