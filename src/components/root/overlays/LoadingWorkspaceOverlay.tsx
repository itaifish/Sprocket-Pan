import { selectIsLoadingWorkspace } from '@/state/ui/selectors';
import { Stack, CircularProgress, Typography, Box } from '@mui/joy';
import { useSelector } from 'react-redux';

export function LoadingWorkspaceOverlay() {
	const isLoading = useSelector(selectIsLoadingWorkspace);
	return (
		<Stack
			alignItems="center"
			justifyContent="center"
			gap={2}
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
			<Stack
				alignItems="center"
				justifyContent="center"
				gap={2}
				sx={{ transition: 'opacity 1s ease-in 0.5s', opacity: isLoading ? 1 : 0 }}
			>
				<CircularProgress
					sx={{
						'--CircularProgress-size': '250px',
						'--CircularProgress-trackThickness': '20px',
						'--CircularProgress-progressThickness': '20px',
					}}
					variant="solid"
				/>
				<Typography level="h3">Loading Workspace</Typography>
			</Stack>
			<Box sx={{ transition: 'opacity 1s ease-in 8s', opacity: isLoading ? 1 : 0 }} textAlign="center">
				<Typography level="body-lg">Loading large workspaces or lengthy histories may take a while.</Typography>
				<Typography level="body-lg">Your workspace will load soon!</Typography>
			</Box>
		</Stack>
	);
}
