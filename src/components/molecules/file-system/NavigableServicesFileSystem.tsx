import { List, ListDivider, ListItem, ListSubheader } from '@mui/joy';
import { useState } from 'react';
import { CollapseExpandButton } from '../../atoms/buttons/CollapseExpandButton';
import { ServiceFileSystem } from './ServiceFileSystem';
import { EnvironmentFileSystem } from './EnvironmentFileSystem';
import { useSelector } from 'react-redux';
import { selectFilteredNestedIds } from '../../../state/tabs/selectors';
import { selectEnvironments, selectScripts, selectServices } from '../../../state/active/selectors';
import { Box } from '@mui/material';
import { ScriptFileSystem } from './ScriptFileSystem';

export function NavigableServicesFileSystem() {
	const [servicesCollapsed, setServicesCollapsed] = useState(false);
	const [environmentsCollapsed, setEnvironmentsCollapsed] = useState(false);
	const [scriptsCollapsed, setScriptsCollapsed] = useState(false);
	const environments = useSelector(selectEnvironments);
	const environmentIdsUnfiltered = Object.values(environments).map((env) => env.__id);
	const services = useSelector(selectServices);
	const serviceIdsUnfiltered = Object.values(services).map((srv) => srv.id);
	const environmentIds = useSelector((state) => selectFilteredNestedIds(state, environmentIdsUnfiltered));
	const serviceIds = useSelector((state) => selectFilteredNestedIds(state, serviceIdsUnfiltered));
	const scripts = useSelector(selectScripts);
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
							environmentIds.map((environmentId, index) => (
								<div key={environmentId}>
									{index !== 0 && <ListDivider />}
									<EnvironmentFileSystem environmentId={environmentId} />
								</div>
							))}
					</List>
				</ListItem>
				<ListDivider />
				<ListItem nested>
					<ListSubheader>
						Scripts
						<CollapseExpandButton collapsed={scriptsCollapsed} setCollapsed={setScriptsCollapsed} />
					</ListSubheader>
					<List
						aria-labelledby="nav-list-browse"
						sx={{
							'& .JoyListItemButton-root': { p: '8px' },
						}}
					>
						{!scriptsCollapsed &&
							Object.keys(scripts).map((scriptId, index) => (
								<Box key={index}>
									{index !== 0 && <ListDivider />}
									<ScriptFileSystem scriptId={scriptId} />
								</Box>
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
							serviceIds.map((serviceId) => (
								<div key={serviceId}>
									<ServiceFileSystem serviceId={serviceId} />
									<ListDivider />
								</div>
							))}
					</List>
				</ListItem>
			</List>
		</>
	);
}
