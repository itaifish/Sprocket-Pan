import { ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import { EndpointRequest } from '../../types/application-data/application-data';
import { useContext } from 'react';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { TabsContext } from '../../App';
import { keepStringLengthReasonable } from '../../utils/string';
import { tabsManager } from '../../managers/TabsManager';

export function RequestFileSystem({ request }: { request: EndpointRequest }) {
	const tabsContext = useContext(TabsContext);
	const { tabs } = tabsContext;
	return (
		<ListItem nested>
			<ListItemButton
				onClick={() => {
					tabsManager.selectTab(tabsContext, request.id, 'request');
				}}
				selected={tabs.selected === request.id}
			>
				<ListItemDecorator>
					<TextSnippetIcon fontSize="small" />
				</ListItemDecorator>
				<ListSubheader>{keepStringLengthReasonable(request.name)}</ListSubheader>
			</ListItemButton>
		</ListItem>
	);
}
