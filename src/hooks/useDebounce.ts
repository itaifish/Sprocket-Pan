import { useEffect, useState } from 'react';
import { Constants } from '@/constants/constants';

interface UseDebounceProps<T> {
	state: T;
	setState: (newState: T) => void;
	debounceMS?: number;
	writeOnClose?: boolean;
	onDesync?: () => void;
	onSync?: () => void;
}

export const useDebounce = <TData>({
	state,
	setState,
	debounceMS = Constants.debounceTimeMS,
	writeOnClose,
	onDesync,
	onSync,
}: UseDebounceProps<TData>) => {
	const [localDataState, setLocalDataState] = useState<TData>(state);
	const [isDebouncing, setIsDebouncing] = useState(false);

	const onSyncInternal = () => {
		onSync?.();
		setIsDebouncing(false);
	};

	const onDesyncInternal = () => {
		onDesync?.();
		setIsDebouncing(true);
	};

	// When the state changes, set the local state to the state
	useEffect(() => {
		if (JSON.stringify(localDataState) !== JSON.stringify(state)) {
			setLocalDataState(structuredClone(state));
			onSyncInternal();
		}
	}, [state]);

	// when the local state changes, update the state
	useEffect(() => {
		const timeout = setTimeout(() => {
			if (JSON.stringify(localDataState) !== JSON.stringify(state)) {
				setState(localDataState);
			}
			onSyncInternal();
		}, debounceMS);
		onDesyncInternal();
		return () => clearTimeout(timeout);
	}, [localDataState]);

	// on component unmount, we want to save the local state
	useEffect(() => {
		return () => {
			if (writeOnClose && localDataState != null) {
				setState(localDataState);
			}
		};
	}, []);

	return { localDataState, setLocalDataState, isDebouncing };
};
