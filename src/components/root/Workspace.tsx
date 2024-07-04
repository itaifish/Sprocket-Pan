import { Box, Grid, Card, Typography } from '@mui/joy';
import { useSelector } from 'react-redux';
import { selectActiveWorkspace } from '../../state/workspaces/selectors';
import { TabHeader } from '../header/TabHeader';
import { SearchInputField } from '../sidebar/SearchInputField';
import { SideDrawer } from '../sidebar/SideDrawer';
import { SideDrawerActions } from '../sidebar/SideDrawerActions';
import { NavigableServicesFileSystem } from '../sidebar/file-system/NavigableServicesFileSystem';

export function Workspace() {
	const activeWorkspace = useSelector(selectActiveWorkspace);

	console.log('the root re-rendered');
	console.log({ activeWorkspace });

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
						<Card sx={{ position: 'fixed', zIndex: 120 }}>
							<SideDrawerActions />
							<SearchInputField />
						</Card>
						<Typography sx={{ paddingTop: '200px', textAlign: 'center' }} level="h3">
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
