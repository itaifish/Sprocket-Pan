import { ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import { EndpointRequest } from '../../types/application-data/application-data';
import { useContext } from 'react';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { SelectedRequestContext } from '../../App';
import { keepStringLengthReasonable } from '../../utils/string';

export function RequestFileSystem({ request }: { request: EndpointRequest }) {
	const { selectedRequest, setSelectedRequest } = useContext(SelectedRequestContext);
	return (
		<ListItem nested>
			<ListItemButton
				onClick={() => {
					setSelectedRequest(request.id);
				}}
				selected={selectedRequest === request.id ?? false}
			>
				<ListItemDecorator>
					<TextSnippetIcon fontSize="small" />
				</ListItemDecorator>
				<ListSubheader>{keepStringLengthReasonable(request.name)}</ListSubheader>
			</ListItemButton>
		</ListItem>
	);
}
