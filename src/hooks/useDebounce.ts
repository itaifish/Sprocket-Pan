import { useEffect, useMemo, useState } from 'react';
import { Constants } from '../utils/constants';
import { EventEmitter } from '@tauri-apps/api/shell';

interface UseDebounceProps<T> {
	state: T;
	setState: React.Dispatch<React.SetStateAction<T>> | ((newState: T) => void);
	debounceOverride?: number;
}

export const useDebounce = <TData>(props: UseDebounceProps<TData>) => {
	const [localDataState, setLocalDataState] = useState<TData>(props.state);
	const [typingBufferTimeout, setTypingBufferTimeout] = useState<null | NodeJS.Timeout>(null);
	const debounceEventEmitter = useMemo(() => new EventEmitter<'sync' | 'desync'>(), []);

	// When the state changes, set the local state to the state
	useEffect(() => {
		if (JSON.stringify(localDataState) !== JSON.stringify(props.state)) {
			setLocalDataState(structuredClone(props.state));
			debounceEventEmitter.emit('sync');
		}
	}, [props.state]);
	// when the local state changes, if it is different from the state, update the state
	useEffect(() => {
		if (localDataState == undefined) {
			return;
		}
		const timeout = setTimeout(() => {
			if (JSON.stringify(localDataState) !== JSON.stringify(props.state)) {
				props.setState(localDataState);
				debounceEventEmitter.emit('sync');
			}
		}, props.debounceOverride ?? Constants.debounceTimeMS);
		setTypingBufferTimeout((oldTimeout) => {
			clearTimeout(oldTimeout ?? undefined);
			return timeout;
		});
		debounceEventEmitter.emit('desync');
	}, [localDataState]);

	return { localDataState, setLocalDataState, debounceEventEmitter };
};
