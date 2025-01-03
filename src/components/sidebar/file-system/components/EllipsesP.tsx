import { PropsWithChildren, CSSProperties } from 'react';

interface EllipsesPProps extends PropsWithChildren {
	style?: CSSProperties;
}

export function EllipsesP({ children, style }: EllipsesPProps) {
	return (
		<p
			style={{
				maxWidth: '100%',
				width: 'fit-content',
				textOverflow: 'ellipsis',
				textWrap: 'nowrap',
				whiteSpace: 'nowrap',
				overflow: 'hidden',
				...style,
			}}
		>
			{children}
		</p>
	);
}
