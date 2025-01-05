import { log } from '@/utils/logging';
import { appLocalDataDir, join } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/tauri';

export type InvokerPath = { path: string; absolute?: boolean };
export type InvokerFileUpdate = InvokerPath & { contents: string };
export type InvokerFileError = { path: string; error: string };

export class RustInvoker {
	private static async absolutify({ path, absolute }: InvokerPath) {
		if (absolute) return path;
		return await join(await appLocalDataDir(), path);
	}
	/**
	 * Saves files. Relative paths are from SprocketPan's base directory (eg \AppData\Local\com.sprocketpan.dev\ on Windows)
	 * @data file contents and paths to save
	 */
	static async saveFiles(data: InvokerFileUpdate[]) {
		for (const file of data) {
			file.path = await this.absolutify(file);
		}
		log.debug(`save_files invoked on paths ${data.map((file) => file.path)}`);
		const errors = await invoke<InvokerFileError[]>('save_files', { data });
		if (errors.length > 0) throw new Error(errors.map(({ path, error }) => `${error} at path ${path}`).join(', '));
	}
	static async showInExplorer(path: InvokerPath) {
		return await invoke<void>('show_in_explorer', { path: await this.absolutify(path) });
	}
	static zoom(amount: number) {
		return invoke<boolean>('zoom', { amount });
	}
	static closeSplashscreen() {
		return invoke<void>('close_splashscreen');
	}
}
