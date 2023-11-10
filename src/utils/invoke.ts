import { invoke as tauriInvoke } from '@tauri-apps/api/tauri';

type InvokeMap = {
	greet: {
		returnType: string;
		args: {
			name: string;
		};
	};
	close_splashscreen: {
		returnType: void;
		args: undefined;
	};
};

type InvocationName = keyof InvokeMap;

export default function invoke<TInvocationName extends InvocationName>(
	command: TInvocationName,
	args: InvokeMap[TInvocationName]['args'],
) {
	return tauriInvoke<InvokeMap[TInvocationName]['returnType']>(command, args);
}
