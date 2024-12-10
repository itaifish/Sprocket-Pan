import { List, ListItem, ListSubheader, Stack } from '@mui/joy';
import { PropsWithChildren } from 'react';
import { CollapseExpandButton } from '../../buttons/CollapseExpandButton';
import { useAppDispatch } from '../../../../state/store';
import { useSelector } from 'react-redux';
import { selectUiMetadataById } from '../../../../state/active/selectors';
import { activeActions } from '../../../../state/active/slice';

interface FileSystemTrunkProps extends PropsWithChildren {
	id: string;
	header: string | React.ReactNode;
	actions?: React.ReactNode;
	isCollapsed?: boolean;
}

export function FileSystemTrunk({ id, children, header, actions }: FileSystemTrunkProps) {
	const dispatch = useAppDispatch();
	const collapsed = useSelector((state) => selectUiMetadataById(state, id))?.collapsed ?? false;
	const setCollapsed = (value: boolean) => {
		dispatch(activeActions.setUiMetadataById({ id: id, collapsed: value }));
	};
	return (
		<ListItem id={id} nested>
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
