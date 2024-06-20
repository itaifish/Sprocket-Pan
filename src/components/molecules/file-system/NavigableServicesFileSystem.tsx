import { List, ListDivider, ListItem, ListSubheader } from '@mui/joy';
import { useContext, useMemo, useState } from 'react';
import { getValidIdsFromSearchTerm } from '../../../utils/search';
import { CollapseExpandButton } from '../../atoms/buttons/CollapseExpandButton';
import { ServiceFileSystem } from './ServiceFileSystem';
import { EnvironmentFileSystem } from './EnvironmentFileSystem';
import { ServicesSearchContext } from '../../../managers/GlobalContextManager';
import { selectActiveState, selectEnvironments, selectServices } from '../../../state/active/selectors';
import { useSelector } from 'react-redux';

export function NavigableServicesFileSystem() {
	const [servicesCollapsed, setServicesCollapsed] = useState(false);
	const [environmentsCollapsed, setEnvironmentsCollapsed] = useState(false);

	const applicationData = useSelector(selectActiveState);
	const environments = useSelector(selectEnvironments);
	const services = useSelector(selectServices);

	const { searchText } = useContext(ServicesSearchContext);
	const validIds = useMemo(() => {
		return getValidIdsFromSearchTerm(searchText, applicationData);
	}, [applicationData, searchText]);

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
							Object.values(environments)
								.filter((env) => validIds.has(env.__id))
								.sort((a, b) => a.__name.localeCompare(b.__name))
								.map((env, index, arr) => (
									<div key={index}>
										<EnvironmentFileSystem environment={env} />
										{index != arr.length - 1 && <ListDivider />}
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
							Object.values(services)
								.filter((service) => validIds.has(service.id))
								.sort((a, b) => a.name.localeCompare(b.name))
								.map((service, index) => (
									<div key={index}>
										<ServiceFileSystem service={service} validIds={validIds} />
										<ListDivider />
									</div>
								))}
					</List>
				</ListItem>
			</List>
		</>
	);
}
