import { useEffect, useState } from 'react';
import { Constants } from '../utils/constants';

interface UseDebounceProps<T> {
	state: T;
	setState: React.Dispatch<React.SetStateAction<T>> | ((newState: T) => void);
}

export const useDebounce = <TData>(props: UseDebounceProps<TData>) => {
	const [localDataState, setLocalDataState] = useState<TData>(props.state);
	const [typingBufferTimeout, setTypingBufferTimeout] = useState<null | NodeJS.Timeout>(null);

	// When the state changes, set the local state to the state
	useEffect(() => {
		setLocalDataState(structuredClone(props.state));
	}, [props.state]);
	// when the local state changes, if it is different from the state, update the state
	useEffect(() => {
		if (localDataState == undefined) {
			return;
		}
		clearTimeout(typingBufferTimeout ?? undefined);
		const timeout = setTimeout(() => {
			if (JSON.stringify(localDataState) !== JSON.stringify(props.state)) {
				props.setState(localDataState);
			}
		}, Constants.debounceTimeMS);
		setTypingBufferTimeout(timeout);
	}, [localDataState]);

	return { localDataState, setLocalDataState };
};
