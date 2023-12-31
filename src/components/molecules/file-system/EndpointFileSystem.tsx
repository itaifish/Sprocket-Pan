import {
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemDecorator,
	ListSubheader,
	Menu,
	Dropdown,
	MenuButton,
	MenuItem,
	Chip,
	ListItemContent,
} from '@mui/joy';
import { Endpoint, EndpointRequest } from '../../../types/application-data/application-data';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { useContext, useState } from 'react';
import { RequestFileSystem } from './RequestFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { MoreVert } from '@mui/icons-material';
import { tabsManager } from '../../../managers/TabsManager';
import { keepStringLengthReasonable } from '../../../utils/string';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { AreYouSureModal } from '../../atoms/modals/AreYouSureModal';
import { verbColors } from '../../../utils/style';
import { ApplicationDataContext, TabsContext } from '../../../managers/GlobalContextManager';

export function EndpointFileSystem({ endpoint, validIds }: { endpoint: Endpoint; validIds: Set<string> }) {
	const tabsContext = useContext(TabsContext);
	const { tabs } = tabsContext;
	const [collapsed, setCollapsed] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const data = useContext(ApplicationDataContext);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
							applicationDataManager.addNew('endpoint', { serviceId: endpoint.serviceId }, endpoint);
						}}
					>
						<ListItemDecorator>
							<IconButton aria-label="copy endpoint" size="sm">
								<FolderCopyIcon fontSize="small" />
							</IconButton>
							Duplicate
						</ListItemDecorator>
					</MenuItem>
					<MenuItem
						onClick={() => {
							setMenuOpen(false);
							applicationDataManager.addNew('request', { endpointId: endpoint.id });
						}}
					>
						<ListItemDecorator>
							<IconButton aria-label="add new request" size="sm">
								<AddBoxIcon fontSize="small" />
							</IconButton>
							Add Request
						</ListItemDecorator>
					</MenuItem>
					<MenuItem
						onClick={() => {
							setMenuOpen(false);
							setDeleteModalOpen(true);
						}}
					>
						<ListItemDecorator>
							<IconButton aria-label="delete endpoint" size="sm">
								<DeleteForeverIcon fontSize="small" />
							</IconButton>
							Delete
						</ListItemDecorator>
					</MenuItem>
				</Menu>
			</Dropdown>
		</>
	);
	return (
		<ListItem nested endAction={<>{menuButton}</>}>
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
				<ListItemContent>{keepStringLengthReasonable(endpoint.name)}</ListItemContent>
				<ListSubheader>
					<Chip size="sm" variant="outlined" color={verbColors[endpoint.verb]}>
						{endpoint.verb}
					</Chip>
				</ListSubheader>
			</ListItemButton>
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
			<AreYouSureModal
				action={`delete '${endpoint.name}' and all its data`}
				open={deleteModalOpen}
				closeFunc={() => setDeleteModalOpen(false)}
				actionFunc={() => applicationDataManager.delete('endpoint', endpoint.id, tabsContext)}
			/>
		</ListItem>
	);
}
