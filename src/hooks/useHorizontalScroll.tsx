import { useEffect, useRef } from 'react';

export function useHorizontalScroll() {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	function scrollHorizontally(e: WheelEvent) {
		if (scrollRef.current == null) return;
		e.preventDefault();
		// the best strat would be to get the one with the highest amplitude and use that
		// but I don't want to atm
		scrollRef.current.scrollBy({ left: e.deltaX + e.deltaY + e.deltaZ });
	}
	useEffect(() => {
		scrollRef.current?.addEventListener('wheel', scrollHorizontally);
		return () => scrollRef.current?.removeEventListener('wheel', scrollHorizontally);
	});
	return scrollRef;
}
