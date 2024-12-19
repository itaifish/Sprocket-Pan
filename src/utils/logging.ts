import { UnlistenFn } from '@tauri-apps/api/event';
import { info, warn, debug, error, trace, attachConsole } from 'tauri-plugin-log-api';

type LogAction = 'info' | 'warn' | 'debug' | 'error' | 'trace';

class Logger {
	public static readonly INSTANCE = new Logger();

	public readonly LOG_FILE_NAME = 'SprocketPan.log';

	private attachProcess: Promise<UnlistenFn>;
	private tauriLog = { info, warn, debug, error, trace };

	private constructor() {
		this.attachProcess = attachConsole();
	}

	public info(data: unknown, logLengthOverride?: number) {
		this.log('info', data, logLengthOverride);
	}

	public warn(data: unknown, logLengthOverride?: number) {
		this.log('warn', data, logLengthOverride);
	}

	public debug(data: unknown, logLengthOverride?: number) {
		this.log('debug', data, logLengthOverride);
	}

	public error<TErrorLog>(data: Error | TErrorLog, logLengthOverride?: number) {
		const dError = data as Error;
		if (dError.stack) {
			this.log('error', dError.stack);
		}
		this.log('error', data, logLengthOverride);
	}

	public trace(data: unknown, logStackLength?: number) {
		this.log('trace', data, logStackLength);
	}

	private log<TLogFunction extends LogAction>(action: TLogFunction, data: unknown, logStackLength?: number) {
		let typedData: string;
		if (typeof data != 'string') {
			typedData = JSON.stringify(data);
		} else {
			typedData = data;
		}
		const stack = new Error().stack
			?.split('\n')
			.slice(3, 3 + Math.max(logStackLength ?? 4, 0))
			.join('\n')
			.replaceAll(/http:\/\/localhost:[0-9]+\//gm, '')
			.replaceAll(/\?t=[0-9]+:[0-9]+:[0-9]+/gm, '');
		this.attachProcess.then(() => {
			this.tauriLog[action](`${typedData}\n${stack}`, { file: this.LOG_FILE_NAME });
		});
	}
}

export const log = Logger.INSTANCE;
