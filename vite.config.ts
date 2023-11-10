import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import { nodePolyfills } from 'vite-plugin-node-polyfills';


// Code breaks when I don't add this. NO FUCKIGN CLUE WHY.
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
		commonjsOptions: {
			transformMixedEsModules: false,
			exclude: ['node_modules/lodash-merge/**'],
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
