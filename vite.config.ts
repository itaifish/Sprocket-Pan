import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'node:path';

/**
 * The production build breaks without this. I have no clue why. I tried googling it, 0 results found.
 * Nothing in the docs. Is it Vite's Fault? Tauri's? Some random dependancy? I don't know.
 * This works though - in both minified and non-minified builds. So yeah...
 * The workaround is literally just adding another if check to prevent an error
 */
function getCustomNoNullDefaultsPlugin(): Plugin {
	return {
		name: 'no-defaults',
		transform(code, _id, _options) {
			return {
				code: code.replace(
					/typeof (.*) === "object" && typeof (.*)\.exports === "object"/g,
					`typeof $1 === "object" && typeof $1.exports === "object" && $1.exports.default`,
				),
			};
		},
	};
}

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [
		react(),
		eslint(),
		nodePolyfills({
			include: ['process'],
		}),
		getCustomNoNullDefaultsPlugin(),
	],
	build: {
		minify: false,
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, 'index.html'),
				splashscreen: path.resolve(__dirname, 'splashscreen.html'),
			},
		},
	},

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
	},
	// 3. to make use of `TAURI_DEBUG` and other env variables
	// https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
	envPrefix: ['VITE_', 'TAURI_'],
}));
