import { Box, Grid, Card, Typography } from '@mui/joy';
import { useState } from 'react';
import { SearchInputField } from '../atoms/SearchInputField';
import { NavigableServicesFileSystem } from '../molecules/file-system/NavigableServicesFileSystem';
import { SideDrawer } from '../molecules/file-system/SideDrawer';
import { SideDrawerActionButtons } from '../molecules/file-system/SideDrawerActionButtons';
import { TabHeader } from '../molecules/tabs/TabHeader';
import { useSelector } from 'react-redux';
import { selectActiveWorkspace } from '../../state/workspaces/selectors';

export function Workspace() {
	const [searchText, setSearchText] = useState('');
	const activeWorkspace = useSelector(selectActiveWorkspace);

	console.log('the root re-rendered');
	console.log({ searchText, activeWorkspace });

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
							<SideDrawerActionButtons />
							<SearchInputField searchText={searchText} setSearchText={setSearchText} />
						</Card>
						<Typography sx={{ paddingTop: '200px', textAlign: 'center' }} level="h3">
							{activeWorkspace?.name ?? 'Sprocket Pan'}
						</Typography>
						<NavigableServicesFileSystem searchText={searchText} />
					</SideDrawer>
				</Grid>
				<Grid xs={true}>
					<TabHeader />
				</Grid>
			</Grid>
		</Box>
	);
}
