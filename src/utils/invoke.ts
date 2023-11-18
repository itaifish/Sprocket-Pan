import { invoke as tauriInvoke } from '@tauri-apps/api/tauri';

type InvokeMap = {
	close_splashscreen: {
		returnType: void;
		args: undefined;
	};
	zoom: {
		returnType: boolean;
		args: {
			amount: number;
		};
	};
	show_in_explorer: {
		returnType: void;
		args: {
			path: string;
		};
	};
};

type InvocationName = keyof InvokeMap;

export default function invoke<TInvocationName extends InvocationName>(
	command: TInvocationName,
	args: InvokeMap[TInvocationName]['args'],
) {
	return tauriInvoke<InvokeMap[TInvocationName]['returnType']>(command, args);
}
