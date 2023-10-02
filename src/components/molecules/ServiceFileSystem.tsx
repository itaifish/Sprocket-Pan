import { List, ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { Service } from '../../types/application-data/application-data';
import { useContext, useState } from 'react';
import { EndpointFileSystem } from './EndpointFileSystem';
import { keepStringLengthReasonable } from '../../utils/string';
import { ApplicationDataContext } from '../../App';

export function ServiceFileSystem({ service, validIds }: { service: Service; validIds: Set<string> }) {
	const [collapsed, setCollapsed] = useState(false);
	const data = useContext(ApplicationDataContext);

	if (service == null) {
		return <></>;
	}
	return (
		<ListItem nested>
			<ListItemButton
				onClick={() => {
					setCollapsed((wasCollapsed) => !wasCollapsed);
				}}
			>
				<ListItemDecorator>
					{collapsed ? <FolderIcon fontSize="small" /> : <FolderOpenIcon fontSize="small" />}
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
