import { List, ListItem, ListItemButton, ListItemContent, ListItemDecorator, ListSubheader } from '@mui/joy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { Service } from '../../types/application-data/application-data';
import { useState } from 'react';
import { EndpointFileSystem } from './EndpointFileSystem';

export function ServiceFileSystem({ service }: { service: Service }) {
	const [collapsed, setCollapsed] = useState(false);
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
				<ListSubheader>{service.name}</ListSubheader>
			</ListItemButton>
			<List
				aria-labelledby="nav-list-browse"
				sx={{
					'& .JoyListItemButton-root': { p: '8px' },
					'--List-nestedInsetStart': '1rem',
				}}
			>
				{!collapsed &&
					Object.values(service.endpoints)
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((endpoint, index) => (
							<EndpointFileSystem endpoint={endpoint} serviceName={service.name} key={index} />
						))}
			</List>
		</ListItem>
	);
}
