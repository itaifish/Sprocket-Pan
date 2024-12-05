import { PropsWithChildren } from 'react';

export function UriTypography({ children }: PropsWithChildren) {
	return (
		<u>
			<span style={{ overflowWrap: 'anywhere', wordBreak: 'break-all' }}>{children}</span>
		</u>
	);
}
