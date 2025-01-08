import { useScrollbarTheme } from '@/hooks/useScrollbarTheme';
import { Sheet, Stack, useTheme } from '@mui/joy';
import { useSelector } from 'react-redux';
import { selectActiveWorkspace } from '@/state/global/selectors';
import { SidebarTabs } from './types';
import { SideDrawerContent } from './SideDrawerContent';
import { UndoRedoTabsButton } from '../header/UndoRedoTabsButton';
import { EllipsisTypography } from '../shared/EllipsisTypography';

interface SideDrawerProps {
	tab: SidebarTabs;
}

export function SideDrawer({ tab }: SideDrawerProps) {
	const { average: scrollbarTheme } = useScrollbarTheme();
	const activeWorkspace = useSelector(selectActiveWorkspace);
	const theme = useTheme();

	return (
		<Sheet
			variant="soft"
			sx={{
				height: '100vh',
			}}
		>
			<Stack height="100%">
				<Sheet
					variant="soft"
					sx={{
						flex: 0,
						height: '45px',
						minHeight: '45px',
						boxShadow: '0px 5px 20px 0px ' + theme.palette.background.surface,
					}}
				>
					<Stack height="100%" px={1} direction="row" alignItems="center" justifyContent="space-between">
						<EllipsisTypography level="body-lg">{activeWorkspace?.name}</EllipsisTypography>
						<UndoRedoTabsButton />
					</Stack>
				</Sheet>
				<Sheet
					sx={{
						flex: 1,
						overflowY: 'scroll',
						overflowX: 'hidden',
						position: 'relative',
						...scrollbarTheme,
					}}
				>
					<SideDrawerContent tab={tab} />
				</Sheet>
			</Stack>
		</Sheet>
	);
}
