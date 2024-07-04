import { List, ListDivider, ListItem, ListSubheader } from '@mui/joy';
import { CollapseExpandButton } from '../../../atoms/buttons/CollapseExpandButton';
import { ServiceFileSystem } from './ServiceFileSystem';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectServices } from '../../../../state/active/selectors';
import { selectFilteredNestedIds } from '../../../../state/tabs/selectors';

export function ServicesFileSystem() {
	const [servicesCollapsed, setServicesCollapsed] = useState(false);
	const services = useSelector(selectServices);
	const serviceIdsUnfiltered = Object.values(services).map((srv) => srv.id);
	const serviceIds = useSelector((state) => selectFilteredNestedIds(state, serviceIdsUnfiltered));

	return (
		<ListItem nested>
			<ListSubheader>
				Services
				<CollapseExpandButton collapsed={servicesCollapsed} setCollapsed={setServicesCollapsed} />
			</ListSubheader>
			<List
				aria-labelledby="nav-list-browse"
				sx={{
					'& .JoyListItemButton-root': { p: '8px' },
				}}
			>
				{!servicesCollapsed &&
					serviceIds.map((serviceId) => (
						<div key={serviceId}>
							<ServiceFileSystem serviceId={serviceId} />
							<ListDivider />
						</div>
					))}
			</List>
		</ListItem>
	);
}
