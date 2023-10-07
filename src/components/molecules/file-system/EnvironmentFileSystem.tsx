import { ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import { Environment } from '../../../types/application-data/application-data';
import { tabsManager } from '../../../managers/TabsManager';
import { keepStringLengthReasonable } from '../../../utils/string';
import { useContext } from 'react';
import { TabsContext } from '../../../App';
import TableChartIcon from '@mui/icons-material/TableChart';

export function EnvironmentFileSystem({ environment }: { environment: Environment }) {
	const tabsContext = useContext(TabsContext);
	const { tabs } = tabsContext;
	return (
		<ListItem nested>
			<ListItemButton
				onClick={() => {
					tabsManager.selectTab(tabsContext, environment.__id, 'environment');
				}}
				selected={tabs.selected === environment.__id}
			>
				<ListItemDecorator>
					<TableChartIcon fontSize="small" />
				</ListItemDecorator>
				<ListSubheader>{keepStringLengthReasonable(environment.__name)}</ListSubheader>
			</ListItemButton>
		</ListItem>
	);
}
