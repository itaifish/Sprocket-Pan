import { List, ListItem, ListItemButton, ListItemContent, ListItemDecorator, ListSubheader } from '@mui/joy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { Service } from '../../types/application-data/application-data';
import { useState } from 'react';

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

			{!collapsed &&
				Object.values(service.endpoints).map((endpoint, index) => (
					<List
						aria-labelledby="nav-list-browse"
						sx={{
							'& .JoyListItemButton-root': { p: '8px' },
							'--List-nestedInsetStart': '1rem',
						}}
						key={index}
					>
						<ListItem nested>
							<ListItemButton>
								<ListItemDecorator>
									{collapsed ? <FolderIcon fontSize="small" /> : <FolderOpenIcon fontSize="small" />}
								</ListItemDecorator>
								<ListSubheader>{endpoint.name}</ListSubheader>
							</ListItemButton>
						</ListItem>
					</List>
				))}
		</ListItem>
	);
}
