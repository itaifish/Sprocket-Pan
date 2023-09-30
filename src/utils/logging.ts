import { UnlistenFn } from '@tauri-apps/api/event';
import { info, warn, debug, error, trace, attachConsole } from 'tauri-plugin-log-api';

type LogAction = 'info' | 'warn' | 'debug' | 'error' | 'trace';

class Logger {
	public static readonly INSTANCE = new Logger();
	private attachProcess: Promise<UnlistenFn>;
	private tauriLog = { info, warn, debug, error, trace };
	private constructor() {
		this.attachProcess = attachConsole();
	}

	public info(data: unknown) {
		this.log('info', data);
	}
	public warn(data: unknown) {
		this.log('warn', data);
	}

	public debug(data: unknown) {
		this.log('debug', data);
	}

	public error<TErrorLog>(data: Error | TErrorLog) {
		const dError = data as Error;
		if (dError.stack) {
			this.log('error', dError.stack);
		}
		this.log('error', data);
	}

	public trace(data: unknown) {
		this.log('trace', data);
	}

	private log<TLogFunction extends LogAction>(action: TLogFunction, data: unknown) {
		let typedData: string;
		if (typeof data != 'string') {
			typedData = JSON.stringify(data);
		} else {
			typedData = data;
		}
		this.attachProcess.then(() => {
			this.tauriLog[action](typedData);
		});
	}
}

export const log = Logger.INSTANCE;
