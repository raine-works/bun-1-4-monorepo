import { describe, expect, it } from 'bun:test';
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from '@tanstack/react-router';
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	cn,
	GlobalMfeNav,
	MfeFooter,
	MfeHeader,
	NotFoundView,
	TelemetryBadge,
	useIsMobile,
} from '@ui/index';
import { renderToString } from 'react-dom/server';

describe('@app/ui Utility Helpers & Hooks', () => {
	it('should merge class names and resolve conflicting Tailwind utilities via cn', () => {
		expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
		expect(cn('bg-red-500', false && 'text-white', 'bg-blue-500')).toBe('bg-blue-500');
		expect(cn(['text-sm', 'font-bold'], { 'opacity-50': true, 'opacity-100': false })).toBe(
			'text-sm font-bold opacity-50',
		);
	});

	it('should render useIsMobile hook with SSR-safe initial value (false)', () => {
		function TestComponent() {
			const isMobile = useIsMobile();
			return <div>{isMobile ? 'Mobile View' : 'Desktop View'}</div>;
		}
		const html = renderToString(<TestComponent />);
		expect(html).toContain('Desktop View');
	});
});

describe('@app/ui Primitive Components', () => {
	it('should render Badge with variant and pulse indicator', () => {
		const html = renderToString(
			<Badge variant="sky" pulse>
				Active
			</Badge>,
		);
		expect(html).toContain('Active');
		expect(html).toContain('bg-sky-500/15');
		expect(html).toContain('animate-pulse');
	});

	it('should render Button with variant and size', () => {
		const html = renderToString(
			<Button variant="primary" size="lg">
				Click Me
			</Button>,
		);
		expect(html).toContain('Click Me');
		expect(html).toContain('bg-sky-500');
		expect(html).toContain('px-5');
	});

	it('should render Card family components', () => {
		const html = renderToString(
			<Card>
				<CardHeader>
					<CardTitle>Title</CardTitle>
					<CardDescription>Description</CardDescription>
				</CardHeader>
				<CardContent>Body</CardContent>
				<CardFooter>Footer</CardFooter>
			</Card>,
		);
		expect(html).toContain('Title');
		expect(html).toContain('Description');
		expect(html).toContain('Body');
		expect(html).toContain('Footer');
	});

	it('should render TelemetryBadge with scope and route', () => {
		const html = renderToString(<TelemetryBadge scope="/store" route="/store/cart" />);
		expect(html).toContain('MFE Scope:');
		expect(html).toContain('/store');
		expect(html).toContain('SPA Route:');
		expect(html).toContain('/store/cart');
	});
});

describe('@app/ui Global Blocks & Navigation', () => {
	it('should render GlobalMfeNav with active link highlighted', () => {
		const html = renderToString(<GlobalMfeNav activeMfe="hub" />);
		expect(html).toContain('Global MFEs:');
		expect(html).toContain('Hub (/)');
		expect(html).toContain('Store (/store)');
		expect(html).toContain('Docs (/docs)');
		expect(html).toContain('bg-pink-500/20');
	});

	it('should render MfeFooter with label and basepath', () => {
		const html = renderToString(<MfeFooter label="Hub MFE" basepath="/" />);
		expect(html).toContain('Hub MFE');
		expect(html).toContain('Basepath:');
		expect(html).toContain('/');
	});

	it('should render MfeHeader inside RouterProvider', async () => {
		const rootRoute = createRootRoute({
			component: () => (
				<MfeHeader
					packageName="@app/hub"
					subtitle="Monorepo Shell"
					title="Hub Micro-Frontend"
					scope="/"
					activeMfe="hub"
					spaLabel="Hub SPA"
				/>
			),
		});
		const indexRoute = createRoute({
			getParentRoute: () => rootRoute,
			path: '/',
			component: () => <div>Home</div>,
		});
		const routeTree = rootRoute.addChildren([indexRoute]);
		const router = createRouter({
			routeTree,
			history: createMemoryHistory({ initialEntries: ['/'] }),
		});
		await router.load();

		const html = renderToString(<RouterProvider router={router} />);
		expect(html).toContain('Hub Micro-Frontend');
		expect(html).toContain('@app/hub');
		expect(html).toContain('Global MFEs');
	});

	it('should render NotFoundView with routing telemetry and links', async () => {
		const rootRoute = createRootRoute({
			component: () => (
				<NotFoundView
					appName="Test App"
					packageName="@app/test"
					badgeLabel="Test 404"
					basepath="/test"
					primaryLink={{ to: '/', label: 'Go Home' }}
					externalLinks={[{ href: '/other', label: 'Other' }]}
				/>
			),
		});
		const routeTree = rootRoute.addChildren([
			createRoute({
				getParentRoute: () => rootRoute,
				path: '/',
				component: () => <div />,
			}),
		]);
		const router = createRouter({
			routeTree,
			history: createMemoryHistory({ initialEntries: ['/test/missing'] }),
		});
		await router.load();

		const html = renderToString(<RouterProvider router={router} />);
		expect(html).toContain('404: Page Not Found');
		expect(html).toContain('Test 404');
		expect(html).toContain('Go Home');
		expect(html).toContain('Other');
	});
});
