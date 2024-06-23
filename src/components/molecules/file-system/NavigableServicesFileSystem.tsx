import { List, ListDivider, ListItem, ListSubheader } from '@mui/joy';
import { useMemo, useState } from 'react';
import { getValidIdsFromSearchTerm } from '../../../utils/search';
import { CollapseExpandButton } from '../../atoms/buttons/CollapseExpandButton';
import { ServiceFileSystem } from './ServiceFileSystem';
import { EnvironmentFileSystem } from './EnvironmentFileSystem';
import { selectEndpoints, selectEnvironments, selectRequests, selectServices } from '../../../state/active/selectors';
import { useSelector } from 'react-redux';

interface NavigableServicesFileSystemProps {
	searchText: string;
}

export function NavigableServicesFileSystem({ searchText }: NavigableServicesFileSystemProps) {
	const [servicesCollapsed, setServicesCollapsed] = useState(false);
	const [environmentsCollapsed, setEnvironmentsCollapsed] = useState(false);

	const environments = useSelector(selectEnvironments);
	const services = useSelector(selectServices);
	const endpoints = useSelector(selectEndpoints);
	const requests = useSelector(selectRequests);

	console.log('file system re-rendered');
	console.log({ searchText, environments, services, endpoints, requests });

	const validIds = useMemo(() => {
		console.log('validIds recalculated');
		return getValidIdsFromSearchTerm(searchText, { environments, services, endpoints, requests });
	}, [environments, services, endpoints, requests, searchText]);

	const envTreeList = useMemo(() => {
		console.log('tree list recalculating: env');
		return Object.values(environments)
			.filter((env) => validIds.has(env.__id))
			.sort((a, b) => a.__name.localeCompare(b.__name));
	}, [validIds, environments]);

	const srvTreeList = useMemo(() => {
		console.log('tree list recalculating: srv');
		return Object.values(services)
			.filter((service) => validIds.has(service.id))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [services, validIds]);

	return (
		<>
			<List size="sm" sx={{ '--ListItem-radius': '8px', '--List-gap': '4px', '--List-nestedInsetStart': '1rem' }}>
				<ListItem nested>
					<ListSubheader>
						Environments
						<CollapseExpandButton collapsed={environmentsCollapsed} setCollapsed={setEnvironmentsCollapsed} />
					</ListSubheader>
					<List
						aria-labelledby="nav-list-browse"
						sx={{
							'& .JoyListItemButton-root': { p: '8px' },
						}}
					>
						{!environmentsCollapsed &&
							envTreeList.map((env, index) => (
								<div key={env.__id}>
									{index !== 0 && <ListDivider />}
									<EnvironmentFileSystem environment={env} />
								</div>
							))}
					</List>
				</ListItem>
				<ListDivider />
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
							srvTreeList.map((srv) => (
								<div key={srv.id}>
									<ServiceFileSystem service={srv} validIds={validIds} />
									<ListDivider />
								</div>
							))}
					</List>
				</ListItem>
			</List>
		</>
	);
}
