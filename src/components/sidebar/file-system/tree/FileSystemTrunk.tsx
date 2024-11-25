import { List, ListItem, ListSubheader, Stack } from '@mui/joy';
import { PropsWithChildren, useState } from 'react';
import { CollapseExpandButton } from '../../buttons/CollapseExpandButton';

interface FileSystemTrunkProps extends PropsWithChildren {
	header: string | React.ReactNode;
	actions?: React.ReactNode;
	isCollapsed?: boolean;
}

export function FileSystemTrunk({ children, header, actions, isCollapsed = false }: FileSystemTrunkProps) {
	const [collapsed, setCollapsed] = useState(isCollapsed);
	return (
		<ListItem nested>
			<ListSubheader>
				<Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" gap={3}>
					{header}
					<Stack direction="row" flex={1} justifyContent="end">
						{actions}
						<CollapseExpandButton collapsed={collapsed} setCollapsed={setCollapsed} />
					</Stack>
				</Stack>
			</ListSubheader>
			<List
				aria-labelledby="nav-list-browse"
				sx={{
					'& .JoyListItemButton-root': { p: '8px' },
				}}
			>
				{!collapsed && children}
			</List>
		</ListItem>
	);
}
