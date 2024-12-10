import { Card, Typography, Sheet, useTheme, Stack, Box } from '@mui/joy';
import { useSelector } from 'react-redux';
import { TabHeader } from '../header/TabHeader';
import { SideDrawer } from '../sidebar/SideDrawer';
import { SideDrawerActions } from '../sidebar/SideDrawerActions';
import { NavigableServicesFileSystem } from '../sidebar/file-system/NavigableServicesFileSystem';
import { selectActiveWorkspace } from '../../state/global/selectors';
import { useAutosave } from './hooks/useAutosave';
import { useScrollbarTheme } from '../../hooks/useScrollbarTheme';

export function Workspace() {
	useAutosave();

	const activeWorkspace = useSelector(selectActiveWorkspace);
	const theme = useTheme();
	const { guttered: scrollbarTheme } = useScrollbarTheme();

	return (
		<Stack
			direction="row"
			justifyContent="stretch"
			alignItems="stretch"
			sx={{
				height: '100vh',
				width: '100vw',
				minHeight: '100vh',
				maxWidth: '100vw',
				overflow: 'hidden',
			}}
		>
			<Box flexBasis={0} width="fit-content" height="100%">
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
			</Box>
			<Box flexGrow={1} width="200px" height="100%" sx={{ overflowY: 'auto', ...scrollbarTheme }}>
				<TabHeader />
			</Box>
		</Stack>
	);
}
