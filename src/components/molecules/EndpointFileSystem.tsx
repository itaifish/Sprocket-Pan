import { List, ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import { Endpoint, EndpointRequest } from '../../types/application-data/application-data';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { useState } from 'react';
import { RequestFileSystem } from './RequestFileSystem';

export function EndpointFileSystem({ endpoint, serviceName }: { endpoint: Endpoint; serviceName: string }) {
	const [collapsed, setCollapsed] = useState(true);

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
				<ListSubheader>{endpoint.name}</ListSubheader>
			</ListItemButton>
			<List
				aria-labelledby="nav-list-browse"
				sx={{
					'& .JoyListItemButton-root': { p: '8px' },
					'--List-nestedInsetStart': '1rem',
				}}
			>
				{!collapsed &&
					Object.values(endpoint.requests).map((request: EndpointRequest, index) => (
						<RequestFileSystem request={request} serviceName={serviceName} endpointName={endpoint.name} key={index} />
					))}
			</List>
		</ListItem>
	);
}
