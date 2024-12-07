import { Box, Grid, Card, Typography, Sheet, useTheme } from '@mui/joy';
import { useSelector } from 'react-redux';
import { TabHeader } from '../header/TabHeader';
import { SideDrawer } from '../sidebar/SideDrawer';
import { SideDrawerActions } from '../sidebar/SideDrawerActions';
import { NavigableServicesFileSystem } from '../sidebar/file-system/NavigableServicesFileSystem';
import { selectActiveWorkspace } from '../../state/global/selectors';
import { useAutosave } from './hooks/useAutosave';

export function Workspace() {
	useAutosave();

	const activeWorkspace = useSelector(selectActiveWorkspace);
	const theme = useTheme();

	return (
		<Box
			sx={{
				minHeight: '100vh',
				maxWidth: '100vw',
			}}
		>
			<Grid container spacing={0}>
				<Grid xs={'auto'}>
					<SideDrawer open={true}>
						<Sheet
							sx={{
								position: 'sticky',
								top: 0,
								left: 0,
								right: 0,
								zIndex: 120,
								outline: `20px solid ${theme.palette.background.surface}`,
								marginBottom: '20px',
							}}
						>
							<Card>
								<SideDrawerActions />
							</Card>
						</Sheet>
						<Typography sx={{ marginTop: 3, textAlign: 'center' }} level="h3">
							{activeWorkspace?.name ?? 'Sprocket Pan'}
						</Typography>
						<NavigableServicesFileSystem />
					</SideDrawer>
				</Grid>
				<Grid xs={true}>
					<TabHeader />
				</Grid>
			</Grid>
		</Box>
	);
}
