import { FluentList } from '@/assets/icons/fluent/FluentList';
import { Workspaces } from '@mui/icons-material';
import { Box, Sheet, Stack, useTheme } from '@mui/joy';
import { SaveButton } from './buttons/SaveButton';
import { SidebarTabs } from './types';
import { SidebarTabButton, SidebarTabButtonProps } from './buttons/SidebarTabButton';
import { FluentCode } from '@/assets/icons/fluent/FluentCode';
import { OpenSettingsButton } from '../shared/buttons/OpenSettingsButton';
import { SettingsPanel } from '../settings/SettingsPanel';
import { TrapezoidalSheet } from '../shared/flair/TrapezoidalSheet';
import { FluentCube } from '@/assets/icons/fluent/FluentCube';

type VerticalMenuProps = Pick<SidebarTabButtonProps, 'tab' | 'setTab' | 'showActive'>;

export function VerticalMenu(args: VerticalMenuProps) {
	const theme = useTheme();
	return (
		<Sheet sx={{ width: '100%', height: '100%', backgroundColor: theme.palette.background.level2 }}>
			<Stack alignItems="stretch" justifyContent="stretch" height="100%">
				<Stack alignItems="center" justifyContent="center" width="100%" height="45px">
					<SaveButton />
				</Stack>
				<TrapezoidalSheet
					color="primary"
					variant="soft"
					sx={{
						py: '45px',
					}}
					vertical
				>
					<SidebarTabButton {...args} value={SidebarTabs.Workspaces}>
						<Workspaces />
					</SidebarTabButton>
					<SidebarTabButton {...args} value={SidebarTabs.Environments}>
						<FluentCube />
					</SidebarTabButton>
					<SidebarTabButton {...args} value={SidebarTabs.Scripts}>
						<FluentCode />
					</SidebarTabButton>
					<SidebarTabButton {...args} value={SidebarTabs.Services}>
						<FluentList />
					</SidebarTabButton>
				</TrapezoidalSheet>
				<Box flex={1} minHeight="100px" />
				<OpenSettingsButton Content={SettingsPanel} />
			</Stack>
		</Sheet>
	);
}
