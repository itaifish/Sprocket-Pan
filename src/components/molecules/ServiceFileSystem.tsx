import { IconButton, List, ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { Service } from '../../types/application-data/application-data';
import { useContext, useState } from 'react';
import { EndpointFileSystem } from './EndpointFileSystem';
import { keepStringLengthReasonable } from '../../utils/string';
import { ApplicationDataContext, TabsContext } from '../../App';
import { tabsManager } from '../../managers/TabsManager';

export function ServiceFileSystem({ service, validIds }: { service: Service; validIds: Set<string> }) {
	const [collapsed, setCollapsed] = useState(false);
	const data = useContext(ApplicationDataContext);
	const tabsContext = useContext(TabsContext);
	const { tabs } = tabsContext;
	if (service == null) {
		return <></>;
	}
	return (
		<ListItem nested>
			<ListItemButton
				onClick={() => {
					tabsManager.selectTab(tabsContext, service.id, 'request');
				}}
				selected={tabs.selected === service.id}
			>
				<ListItemDecorator>
					<IconButton
						onClick={(e) => {
							setCollapsed((wasCollapsed) => !wasCollapsed);
							e.preventDefault();
							e.stopPropagation();
						}}
					>
						{collapsed ? <FolderIcon fontSize="small" /> : <FolderOpenIcon fontSize="small" />}
					</IconButton>
				</ListItemDecorator>
				<ListSubheader>{keepStringLengthReasonable(service.name)}</ListSubheader>
			</ListItemButton>
			<List
				aria-labelledby="nav-list-browse"
				sx={{
					'& .JoyListItemButton-root': { p: '8px' },
					'--List-nestedInsetStart': '1rem',
				}}
			>
				{!collapsed &&
					Object.values(service.endpointIds)
						.filter((endpointId) => validIds.has(endpointId))
						.map((endpointId) => data.endpoints[endpointId])
						.filter((x) => x != null)
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((endpoint, index) => <EndpointFileSystem endpoint={endpoint} validIds={validIds} key={index} />)}
			</List>
		</ListItem>
	);
}
