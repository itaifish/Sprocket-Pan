import { useEffect } from 'react';

interface UseClickOutsideAlerterArgs {
	ref: React.MutableRefObject<HTMLInputElement | null>;
	onOutsideClick: () => void;
}

/**
 * Hook that alerts clicks outside of the passed ref
 */
export function useClickOutsideAlerter({ ref, onOutsideClick }: UseClickOutsideAlerterArgs) {
	useEffect(() => {
		/**
		 * Alert if clicked on outside of element
		 */
		function handleClickOutside(event: MouseEvent) {
			// if not a left click
			if (event.buttons !== 1) {
				return;
			}
			if (ref.current != null && !ref.current.contains(event.target as Node)) {
				onOutsideClick();
			}
		}
		// Bind the DOM event listener
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			// Unbind the DOM event listener on clean up
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [ref]);
}
