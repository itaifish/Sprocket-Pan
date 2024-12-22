import { Container, Sheet } from '@mui/joy';
import { ErrorFallback } from '../shared/ErrorFallback';
import { FallbackProps } from 'react-error-boundary';

export function RootErrorFallback(props: FallbackProps) {
	return (
		<Container sx={{ paddingTop: 4 }}>
			<Sheet sx={{ padding: 4 }}>
				<ErrorFallback {...props} />
			</Sheet>
		</Container>
	);
}
