import { platform } from '@tauri-apps/api/os';

export async function polyfill() {
	const tauriPlatform = await platform();
	(window as any).global = window;
	(window as any).process = { plaform: tauriPlatform };
}
