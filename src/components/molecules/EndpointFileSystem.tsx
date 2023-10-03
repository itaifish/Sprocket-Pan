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
	Menu,
	Dropdown,
	MenuButton,
	MenuItem,
} from '@mui/joy';
import { Endpoint, EndpointRequest } from '../../types/application-data/application-data';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { useContext, useState } from 'react';
import { RequestFileSystem } from './RequestFileSystem';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { applicationDataManager } from '../../managers/ApplicationDataManager';
import { ApplicationDataContext, TabsContext } from '../../App';
import { InfoOutlined, MoreVert } from '@mui/icons-material';
import { keepStringLengthReasonable } from '../../utils/string';
import { tabsManager } from '../../managers/TabsManager';

export function EndpointFileSystem({ endpoint, validIds }: { endpoint: Endpoint; validIds: Set<string> }) {
	const tabsContext = useContext(TabsContext);
	const { tabs } = tabsContext;
	const [collapsed, setCollapsed] = useState(false);
	const [editingText, setEditingText] = useState<null | string>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const data = useContext(ApplicationDataContext);
	const isValidEditingText =
		editingText === null ||
		(editingText != '' &&
			!Object.values(data.services[endpoint.serviceId].endpointIds)
				.map((endpointId) => data.endpoints[endpointId]?.name)
				.filter((name) => name != endpoint.name)
				.includes(editingText));
	const menuButton = (
		<>
			<Dropdown open={menuOpen} onOpenChange={(_event, isOpen) => setMenuOpen(isOpen)}>
				<MenuButton slots={{ root: IconButton }} slotProps={{ root: { variant: 'plain', color: 'neutral' } }}>
					<MoreVert />
				</MenuButton>
				<Menu sx={{ zIndex: 1201 }}>
					<MenuItem
						onClick={() => {
							setMenuOpen(false);
							setEditingText(endpoint.name);
						}}
					>
						<ListItemDecorator>
							<IconButton aria-label="edit endpoint" size="sm">
								<EditIcon fontSize="small" />
							</IconButton>
							Edit
						</ListItemDecorator>
					</MenuItem>
					<MenuItem
						onClick={() => {
							setMenuOpen(false);
							applicationDataManager.createDefaultRequest(endpoint.id);
						}}
					>
						<ListItemDecorator>
							<IconButton aria-label="add new request" size="sm">
								<AddBoxIcon fontSize="small" />
							</IconButton>
							Add Request
						</ListItemDecorator>
					</MenuItem>
				</Menu>
			</Dropdown>
		</>
	);
	return (
		<ListItem nested endAction={editingText === null && <>{menuButton}</>}>
			<ListItemButton
				onClick={() => {
					tabsManager.selectTab(tabsContext, endpoint.id, 'endpoint');
				}}
				selected={tabs.selected === endpoint.id}
			>
				<ListItemDecorator>
					<IconButton
						size="sm"
						onClick={(e) => {
							setCollapsed((wasCollapsed) => !wasCollapsed);
							e.preventDefault();
							e.stopPropagation();
						}}
					>
						{collapsed ? <FolderIcon fontSize="small" /> : <FolderOpenIcon fontSize="small" />}
					</IconButton>
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
									<>
										<IconButton
											onClick={() => {
												setEditingText(null);
											}}
											sx={{ marginRight: '2px' }}
										>
											<CancelIcon fontSize="large" />
										</IconButton>
										<IconButton
											onClick={() => {
												if (isValidEditingText) {
													applicationDataManager.updateEndpoint(endpoint.id, { name: editingText });
													setEditingText(null);
												}
											}}
										>
											<CheckIcon fontSize="large" />
										</IconButton>
									</>
								}
							/>
						</>
					) : (
						keepStringLengthReasonable(endpoint.name)
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
					Object.values(data.endpoints[endpoint.id]?.requestIds)
						.filter((requestId) => validIds.has(requestId))
						.map((requestIds) => data.requests[requestIds])
						.filter((x) => x != null)
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((request: EndpointRequest, index) => <RequestFileSystem request={request} key={index} />)}
			</List>
		</ListItem>
	);
}
