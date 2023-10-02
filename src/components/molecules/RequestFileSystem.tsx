import { ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import { EndpointRequest } from '../../types/application-data/application-data';
import { useContext } from 'react';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { SelectedRequestContext } from '../../App';
import { selectedRequestEquals } from '../../utils/object';
import { keepStringLengthReasonable } from '../../utils/string';

export function RequestFileSystem({
	request,
	serviceName,
	endpointName,
}: {
	request: EndpointRequest;
	serviceName: string;
	endpointName: string;
}) {
	const { selectedRequest, setSelectedRequest } = useContext(SelectedRequestContext);
	const thisRequest = { request: request.name, service: serviceName, endpoint: endpointName };
	return (
		<ListItem nested>
			<ListItemButton
				onClick={() => {
					setSelectedRequest(thisRequest);
				}}
				selected={(selectedRequest && selectedRequestEquals(selectedRequest, thisRequest)) ?? false}
			>
				<ListItemDecorator>
					<TextSnippetIcon fontSize="small" />
				</ListItemDecorator>
				<ListSubheader>{keepStringLengthReasonable(request.name)}</ListSubheader>
			</ListItemButton>
		</ListItem>
	);
}
