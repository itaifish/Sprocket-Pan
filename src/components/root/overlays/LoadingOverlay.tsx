import { selectIsLoading } from '@/state/ui/selectors';
import { Stack, CircularProgress, Typography } from '@mui/joy';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export function LoadingOverlay() {
	const isLoading = useSelector(selectIsLoading);
	const [showStillWorkingOnItDisplay, setShowStillWorkingOnItDisplay] = useState(false);
	useEffect(() => {
		if (isLoading) {
			// after 8 seconds of loading, if we're still loading set the display to true
			setTimeout(() => {
				if (isLoading) {
					setShowStillWorkingOnItDisplay(true);
				}
			}, 8_000);
		} else {
			setShowStillWorkingOnItDisplay(false);
		}
	}, [isLoading]);
	return (
		<Stack
			alignItems="center"
			justifyContent="center"
			sx={{
				position: 'absolute',
				pointerEvents: isLoading ? 'all' : 'none',
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				zIndex: 1995,
				backdropFilter: 'blur(10px)',
				backgroundColor: 'rgba(0,0,0,0.1)',
				transition: 'all 1s ease-in-out',
				opacity: isLoading ? 1 : 0,
			}}
		>
			<CircularProgress
				sx={{
					'--CircularProgress-size': '250px',
					'--CircularProgress-trackThickness': '20px',
					'--CircularProgress-progressThickness': '20px',
				}}
				variant="solid"
			/>
			<Typography level="h1">Loading Workspace...</Typography>
			{showStillWorkingOnItDisplay && (
				<Typography level="h2">
					This may take a while, (likely due to a large history), but Sprocket Pan has not frozen and your workspace
					will load shortly.
				</Typography>
			)}
		</Stack>
	);
}
