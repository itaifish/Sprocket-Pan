import { PropsWithChildren } from 'react';

export function UriTypography({ children }: PropsWithChildren) {
	return (
		<u>
			<span style={{ overflowWrap: 'break-word' }}>{children}</span>
		</u>
	);
}
