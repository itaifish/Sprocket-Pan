import {
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemDecorator,
	ListSubheader,
	Input,
	FormHelperText,
	FormControl,
} from '@mui/joy';
import { Endpoint, EndpointRequest } from '../../types/application-data/application-data';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { useContext, useState } from 'react';
import { RequestFileSystem } from './RequestFileSystem';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { applicationDataManager } from '../../managers/ApplicationDataManager';
import { ApplicationDataContext } from '../../App';
import { InfoOutlined } from '@mui/icons-material';

export function EndpointFileSystem({ endpoint, serviceName }: { endpoint: Endpoint; serviceName: string }) {
	const [collapsed, setCollapsed] = useState(true);
	const [editingText, setEditingText] = useState<null | string>(null);
	const data = useContext(ApplicationDataContext);
	const isValidEditingText =
		editingText === null ||
		(editingText != '' &&
			!Object.values(data.services[serviceName].endpoints)
				.map((endpoint) => endpoint.name)
				.filter((name) => name != endpoint.name)
				.includes(editingText));
	return (
		<ListItem
			nested
			endAction={
				editingText === null && (
					<IconButton
						aria-label="edit endpoint"
						size="sm"
						onClick={() => {
							setEditingText(endpoint.name);
						}}
					>
						<EditIcon fontSize="small" />
					</IconButton>
				)
			}
		>
			<ListItemButton
				onClick={() => {
					setCollapsed((wasCollapsed) => !wasCollapsed);
				}}
			>
				<ListItemDecorator>
					{collapsed ? <FolderIcon fontSize="small" /> : <FolderOpenIcon fontSize="small" />}
				</ListItemDecorator>
				<ListSubheader>
					{editingText != null ? (
						<>
							<Input
								placeholder={endpoint.name}
								variant="outlined"
								value={editingText}
								onChange={(e) => setEditingText(e.target.value)}
								error={!isValidEditingText}
								endDecorator={
									<IconButton
										onClick={() => {
											if (isValidEditingText) {
												applicationDataManager.updateEndpoint(serviceName, endpoint.name, { name: editingText });
												setEditingText(null);
											}
										}}
									>
										<CheckIcon fontSize="large" />
									</IconButton>
								}
							/>
						</>
					) : (
						endpoint.name
					)}
				</ListSubheader>
			</ListItemButton>
			{!isValidEditingText && (
				<FormControl error>
					<FormHelperText color="danger">
						<InfoOutlined />
						Name must be unique
					</FormHelperText>
				</FormControl>
			)}
			<List
				aria-labelledby="nav-list-browse"
				sx={{
					'& .JoyListItemButton-root': { p: '8px' },
					'--List-nestedInsetStart': '1rem',
				}}
			>
				{!collapsed &&
					Object.values(endpoint.requests).map((request: EndpointRequest, index) => (
						<RequestFileSystem request={request} serviceName={serviceName} endpointName={endpoint.name} key={index} />
					))}
			</List>
		</ListItem>
	);
}
