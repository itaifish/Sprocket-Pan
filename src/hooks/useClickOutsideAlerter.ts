import { EventEmitter } from '@tauri-apps/api/shell';
import { useEffect } from 'react';

/**
 * Hook that alerts clicks outside of the passed ref
 */
export function useOutsideAlerter<T extends { contains: (input: unknown) => boolean }>(ref: React.MutableRefObject<T>) {
	const emitter = new EventEmitter<'outsideClick'>();
	useEffect(() => {
		/**
		 * Alert if clicked on outside of element
		 */
		function handleClickOutside(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target)) {
				emitter.emit('outsideClick');
			}
		}
		// Bind the event listener
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener('mousedown', handleClickOutside);
			emitter.removeAllListeners();
		};
	}, [ref]);
	return emitter;
}
