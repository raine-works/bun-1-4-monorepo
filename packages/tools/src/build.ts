import { existsSync, rmSync, watch } from 'node:fs';
import { join } from 'node:path';
import tailwind from 'bun-plugin-tailwind';

/**
 * Options for configuring the frontend build runner.
 */
export interface FrontendBuildOptions {
	/** Human-readable name of the application/micro-frontend (e.g. 'docs', 'hub', 'store'). */
	name: string;
	/** Root directory of the package (containing `src/` and `index.html`). */
	packageDir: string;
	/** Base public URL path for emitted assets (e.g. '/docs/', '/', '/store/'). */
	publicPath: string;
	/** Path to the HTML entrypoint (defaults to `packageDir/index.html`). */
	entrypoint?: string;
	/** Output directory for the bundled assets (defaults to `packageDir/dist`). */
	outdir?: string;
	/** Source directory to watch in dev mode (defaults to `packageDir/src`). */
	srcDir?: string;
	/** Whether watch mode is active (defaults to checking `--watch` in `process.argv`). */
	isWatch?: boolean;
	/** Whether production mode is active (defaults to `NODE_ENV === 'production' || !isWatch`). */
	isProduction?: boolean;
}

/**
 * Executes a single build pass for a micro-frontend or client SPA using `Bun.build`.
 *
 * @param options - Frontend build options.
 * @returns Bun BuildOutput result object.
 */
export async function buildFrontend(options: FrontendBuildOptions) {
	const isWatch = options.isWatch ?? process.argv.includes('--watch');
	const isProduction = options.isProduction ?? (Bun.env.NODE_ENV === 'production' || !isWatch);
	const outdir = options.outdir ?? join(options.packageDir, 'dist');
	const entrypoint = options.entrypoint ?? join(options.packageDir, 'index.html');

	if (!isWatch && existsSync(outdir)) {
		rmSync(outdir, { recursive: true, force: true });
	}

	const buildResult = await Bun.build({
		entrypoints: [entrypoint],
		outdir,
		publicPath: options.publicPath,
		plugins: [tailwind],
		reactCompiler: true,
		target: 'browser',
		minify: isProduction,
		define: {
			'Bun.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
			'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
		},
		splitting: true,
		sourcemap: isWatch ? 'linked' : 'none',
	});

	if (!buildResult.success) {
		console.error(`❌ [${options.name}] Build failed:`);
		for (const log of buildResult.logs) {
			console.error(log);
		}
		if (!isWatch) {
			process.exit(1);
		}
		return buildResult;
	}

	console.log(`✅ [${options.name}] Build succeeded! Emitted ${buildResult.outputs.length} files to ${outdir}`);
	for (const output of buildResult.outputs) {
		console.log(`   - ${output.path} (${output.size} bytes)`);
	}

	return buildResult;
}

/**
 * Runs the frontend build pipeline for CLI execution, handling initial build and `--watch` mode.
 *
 * @param options - Frontend build options.
 */
export async function runFrontendBuildCli(options: FrontendBuildOptions): Promise<void> {
	const isWatch = options.isWatch ?? process.argv.includes('--watch');
	const packageDir = options.packageDir;
	const srcDir = options.srcDir ?? join(packageDir, 'src');
	const entrypoint = options.entrypoint ?? join(packageDir, 'index.html');

	console.log(`⚡ Building ${options.name} with Bun.build, Tailwind CSS, and React Compiler...`);
	await buildFrontend(options);

	if (isWatch) {
		console.log(`👀 Watching for changes in ${options.name} (src/ and index.html)...`);

		let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
		const triggerRebuild = (file: string) => {
			if (rebuildTimer) clearTimeout(rebuildTimer);
			rebuildTimer = setTimeout(async () => {
				console.log(`🔄 File changed (${file}), rebuilding ${options.name}...`);
				await buildFrontend(options);
			}, 50);
		};

		const srcWatcher = existsSync(srcDir)
			? watch(srcDir, { recursive: true }, (_, filename) => {
					if (filename) triggerRebuild(filename);
				})
			: null;

		const indexWatcher = existsSync(entrypoint)
			? watch(entrypoint, () => {
					triggerRebuild('index.html');
				})
			: null;

		const cleanup = () => {
			srcWatcher?.close();
			indexWatcher?.close();
			process.exit(0);
		};

		process.on('SIGINT', cleanup);
		process.on('SIGTERM', cleanup);
	}
}
