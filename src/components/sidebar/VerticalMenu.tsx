import { FluentList } from '@/assets/icons/fluent/FluentList';
import { TableChart, Workspaces } from '@mui/icons-material';
import { Box, IconButton, Sheet, Stack } from '@mui/joy';
import { SaveButton } from './buttons/SaveButton';
import { SidebarTabs } from './types';
import { SidebarTabButton, SidebarTabButtonProps } from './buttons/SidebarTabButton';
import { FluentCode } from '@/assets/icons/fluent/FluentCode';
import { OpenSettingsButton } from '../shared/buttons/OpenSettingsButton';
import { SettingsPanel } from '../settings/SettingsPanel';

type VerticalMenuProps = Pick<SidebarTabButtonProps, 'tab' | 'setTab' | 'showActive'>;

export function VerticalMenu(args: VerticalMenuProps) {
	return (
		<Sheet variant="soft" sx={{ width: '100%', height: '100%' }}>
			<Stack alignItems="stretch" justifyContent="stretch" height="100%">
				<Stack alignItems="center" justifyContent="center" width="100%" height="45px">
					<SaveButton />
				</Stack>
				<Sheet
					color="primary"
					variant="soft"
					sx={{
						py: 5,
						clipPath: 'polygon(0 30px, 100% 0, 100% 100%, 0 calc(100% - 30px))',
					}}
				>
					<SidebarTabButton {...args} value={SidebarTabs.Workspaces}>
						<Workspaces />
					</SidebarTabButton>
					<SidebarTabButton {...args} value={SidebarTabs.Environments}>
						<TableChart />
					</SidebarTabButton>
					<SidebarTabButton {...args} value={SidebarTabs.Scripts}>
						<FluentCode />
					</SidebarTabButton>
					<SidebarTabButton {...args} value={SidebarTabs.Services}>
						<FluentList />
					</SidebarTabButton>
				</Sheet>
				<Box flex={1} minHeight="100px" />
				<IconButton>
					<OpenSettingsButton Content={SettingsPanel} />
				</IconButton>
			</Stack>
		</Sheet>
	);
}
