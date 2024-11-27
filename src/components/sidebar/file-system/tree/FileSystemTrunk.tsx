import { List, ListItem, ListSubheader, Stack } from '@mui/joy';
import { PropsWithChildren } from 'react';
import { CollapseExpandButton } from '../../buttons/CollapseExpandButton';
import { useAppDispatch } from '../../../../state/store';
import { useSelector } from 'react-redux';
import { setUiMetadataByElement } from '../../../../state/active/slice';
import { selectUiMetadataByElement } from '../../../../state/active/selectors';

interface FileSystemTrunkProps extends PropsWithChildren {
	id: string;
	header: string | React.ReactNode;
	actions?: React.ReactNode;
	isCollapsed?: boolean;
}

export function FileSystemTrunk({ id, children, header, actions }: FileSystemTrunkProps) {
	const dispatch = useAppDispatch();
	const collapsed = useSelector((state) => selectUiMetadataByElement(state, id))?.collapsed ?? false;
	const setCollapsed = (value: boolean) => {
		dispatch(setUiMetadataByElement({ id: id, collapsed: value }));
	};
	return (
		<ListItem nested>
			<ListSubheader>
				<Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" gap={3}>
					{header}
					<Stack direction="row" flex={1} justifyContent="end">
						{actions}
						<CollapseExpandButton collapsed={collapsed} toggleCollapsed={() => setCollapsed(!collapsed)} />
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
