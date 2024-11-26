import { useEffect } from 'react';

export function RightClickListener() {
	useEffect(() => {
		function handleRightClick(event: MouseEvent) {
			// if not a right click (See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons)
			if (event.buttons && event.buttons !== 2) {
				return;
			}
			event.preventDefault();
		}
		// Bind the event listener
		// document.addEventListener('mousedown', handleRightClick);
		document.addEventListener('contextmenu', handleRightClick);
		return () => {
			// Unbind the event listener on clean up
			// document.removeEventListener('mousedown', handleRightClick);
			document.removeEventListener('contextmenu', handleRightClick);
		};
	}, []);

	return <></>;
}
