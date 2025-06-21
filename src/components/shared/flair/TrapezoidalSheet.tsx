import { Sheet, SheetProps } from '@mui/joy';

/**
 * Gets clip paths.
 * The horizontal clip paths are 10% larger on the bottom to allow for shadows.
 * The vertical clip paths do not have that wiggle room.
 */
export function getClipPath(vertical = false, reverse = false, size: number) {
	if (vertical) {
		return `polygon(0 ${size}px, 100% 0, 100% 100%, 0 calc(100% - ${size}px))`;
	}
	const upSize = Math.floor(size * 1.1);
	return reverse
		? `polygon(0 0, 100% 0, 100% 110%, ${upSize}px 110%)`
		: `polygon(0 0, 100% 0, calc(100% - ${upSize}px) 110%, 0 110%)`;
}

export interface TrapezoidalSheetProps extends SheetProps {
	vertical?: boolean;
	reverse?: boolean;
	size?: number;
}

export function TrapezoidalSheet({
	vertical = false,
	reverse = false,
	size = 45,
	sx,
	...props
}: TrapezoidalSheetProps) {
	const path = getClipPath(vertical, reverse, size);
	return (
		<Sheet
			sx={{ height: vertical ? 'auto' : size, width: vertical ? size : 'auto', ...sx, clipPath: path }}
			{...props}
		/>
	);
}
