import { Typography } from '@mui/joy';

const TIPS: React.ReactNode[] = [<>You can ctrl+click on underlined URLs to open them in your default browser.</>];

export function Tips() {
	const num = Math.floor(Math.random() * TIPS.length);
	return (
		<Typography overflow="hidden" maxHeight="37px" level="body-sm">
			Tip: {TIPS[num]}
		</Typography>
	);
}
