import { useRef } from 'react';
import { v4 } from 'uuid';

export function useComponentIdentifier() {
	const ref = useRef(v4());
	return ref.current;
}
