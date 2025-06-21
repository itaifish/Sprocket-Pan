import { log } from '@/utils/logging';
import { Warning } from '@mui/icons-material';
import { Alert, Sheet, Stack, Typography } from '@mui/joy';
import { useEffect } from 'react';
import { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ error }: FallbackProps) {
	useEffect(() => {
		log.error(error);
	}, []);
	return (
		<Stack gap={2}>
			<Typography level="h4" color="danger">
				An unexpected error has occurred!
			</Typography>
			<Sheet variant="outlined" sx={{ padding: 2, maxHeight: '200px', overflow: 'auto' }}>
				<Typography level="body-sm" fontFamily="monospace">
					{error.stack}
				</Typography>
			</Sheet>
			<Alert color="warning" variant="outlined" startDecorator={<Warning />} endDecorator={<Warning />}>
				This trace may include sensitive information. Be sure to inspect it before posting it publicly.
			</Alert>
		</Stack>
	);
}
