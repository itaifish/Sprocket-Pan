import { ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import { Environment } from '../../../types/application-data/application-data';
import { tabsManager } from '../../../managers/TabsManager';
import { keepStringLengthReasonable } from '../../../utils/string';
import { useContext } from 'react';
import { ApplicationDataContext, TabsContext } from '../../../App';
import TableChartIcon from '@mui/icons-material/TableChart';

export function EnvironmentFileSystem({ environment }: { environment: Environment }) {
	const tabsContext = useContext(TabsContext);
	const data = useContext(ApplicationDataContext);
	const { tabs } = tabsContext;
	const selected = tabs.selected === environment.__id;
	return (
		<ListItem nested>
			<ListItemButton
				onClick={() => {
					tabsManager.selectTab(tabsContext, environment.__id, 'environment');
				}}
				selected={selected}
				color={data.selectedEnvironment === environment.__id ? 'success' : 'neutral'}
			>
				<ListItemDecorator>
					<TableChartIcon fontSize="small" />
				</ListItemDecorator>
				<ListSubheader>{keepStringLengthReasonable(environment.__name)}</ListSubheader>
			</ListItemButton>
		</ListItem>
	);
}
