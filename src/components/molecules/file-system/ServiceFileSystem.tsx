import {
	Dropdown,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemDecorator,
	ListSubheader,
	Menu,
	MenuButton,
	MenuItem,
} from '@mui/joy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { useState, useContext } from 'react';
import { ApplicationDataContext, TabsContext } from '../../../App';
import { tabsManager } from '../../../managers/TabsManager';
import { Service } from '../../../types/application-data/application-data';
import { keepStringLengthReasonable } from '../../../utils/string';
import { EndpointFileSystem } from './EndpointFileSystem';
import { MoreVert } from '@mui/icons-material';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { AreYouSureModal } from '../../atoms/modals/AreYouSureModal';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';

export function ServiceFileSystem({ service, validIds }: { service: Service; validIds: Set<string> }) {
	const [collapsed, setCollapsed] = useState(false);
	const data = useContext(ApplicationDataContext);
	const tabsContext = useContext(TabsContext);
	const [menuOpen, setMenuOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const { tabs } = tabsContext;
	if (service == null) {
		return <></>;
	}
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
							applicationDataManager.addNew('service', undefined, service);
						}}
					>
						<ListItemDecorator>
							<IconButton aria-label="copy service" size="sm">
								<FolderCopyIcon fontSize="small" />
							</IconButton>
							Duplicate
						</ListItemDecorator>
					</MenuItem>
					<MenuItem
						onClick={() => {
							setMenuOpen(false);
							applicationDataManager.addNew('endpoint', { serviceId: service.id });
						}}
					>
						<ListItemDecorator>
							<IconButton aria-label="add new endpoint" size="sm">
								<AddBoxIcon fontSize="small" />
							</IconButton>
							Add Endpoint
						</ListItemDecorator>
					</MenuItem>

					<MenuItem
						onClick={() => {
							setMenuOpen(false);
							setDeleteModalOpen(true);
						}}
					>
						<ListItemDecorator>
							<IconButton aria-label="delete service" size="sm">
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
					tabsManager.selectTab(tabsContext, service.id, 'service');
				}}
				selected={tabs.selected === service.id}
			>
				<ListItemDecorator>
					<IconButton
						onClick={(e) => {
							setCollapsed((wasCollapsed) => !wasCollapsed);
							e.preventDefault();
							e.stopPropagation();
						}}
					>
						{collapsed ? <FolderIcon fontSize="small" /> : <FolderOpenIcon fontSize="small" />}
					</IconButton>
				</ListItemDecorator>
				<ListSubheader>{keepStringLengthReasonable(service.name)}</ListSubheader>
			</ListItemButton>
			<List
				aria-labelledby="nav-list-browse"
				sx={{
					'& .JoyListItemButton-root': { p: '8px' },
					'--List-nestedInsetStart': '1rem',
				}}
			>
				{!collapsed &&
					Object.values(service.endpointIds)
						.filter((endpointId) => validIds.has(endpointId))
						.map((endpointId) => data.endpoints[endpointId])
						.filter((x) => x != null)
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((endpoint, index) => <EndpointFileSystem endpoint={endpoint} validIds={validIds} key={index} />)}
			</List>
			<AreYouSureModal
				action={`delete '${service.name}' and all its data`}
				open={deleteModalOpen}
				closeFunc={() => setDeleteModalOpen(false)}
				actionFunc={() => applicationDataManager.delete('service', service.id, tabsContext)}
			/>
		</ListItem>
	);
}
