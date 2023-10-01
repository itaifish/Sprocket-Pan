import { List, ListItem, ListSubheader } from '@mui/joy';
import { useContext, useState } from 'react';
import { ApplicationDataContext } from '../../App';
import { ServiceFileSystem } from './ServiceFileSystem';
import { CollapseExpandButton } from '../atoms/buttons/CollapseExpandButton';

export function NavigableServicesFileSystem() {
	const [collapsed, setCollapsed] = useState(false);
	const applicationData = useContext(ApplicationDataContext);
	return (
		<>
			<List size="sm" sx={{ '--ListItem-radius': '8px', '--List-gap': '4px', '--List-nestedInsetStart': '1rem' }}>
				<ListItem nested>
					<ListSubheader>
						Services
						<CollapseExpandButton collapsed={collapsed} setCollapsed={setCollapsed} />
					</ListSubheader>
					<List
						aria-labelledby="nav-list-browse"
						sx={{
							'& .JoyListItemButton-root': { p: '8px' },
						}}
					>
						{!collapsed &&
							Object.values(applicationData.services).map((service, index) => (
								<ServiceFileSystem service={service} key={index} />
							))}
					</List>
				</ListItem>
			</List>
		</>
	);
}
