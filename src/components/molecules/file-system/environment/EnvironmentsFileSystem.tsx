import { List, ListDivider, ListItem, ListSubheader } from '@mui/joy';
import { CollapseExpandButton } from '../../../atoms/buttons/CollapseExpandButton';
import { EnvironmentFileSystem } from './EnvironmentFileSystem';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectEnvironments } from '../../../../state/active/selectors';
import { selectFilteredNestedIds } from '../../../../state/tabs/selectors';

export function EnvironmentsFileSystem() {
	const [environmentsCollapsed, setEnvironmentsCollapsed] = useState(false);
	const environments = useSelector(selectEnvironments);
	const environmentIdsUnfiltered = Object.values(environments).map((env) => env.__id);
	const environmentIds = useSelector((state) => selectFilteredNestedIds(state, environmentIdsUnfiltered));

	return (
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
				<EnvironmentsFileSystem />
				{!environmentsCollapsed &&
					environmentIds.map((environmentId, index) => (
						<div key={environmentId}>
							{index !== 0 && <ListDivider />}
							<EnvironmentFileSystem environmentId={environmentId} />
						</div>
					))}
			</List>
		</ListItem>
	);
}
