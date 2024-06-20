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
import { memo, useContext, useState } from 'react';
import { MemoizedRequestFileSystem as RequestFileSystem } from './RequestFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { MoreVert } from '@mui/icons-material';
import { tabsManager } from '../../../managers/TabsManager';
import { keepStringLengthReasonable } from '../../../utils/string';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { AreYouSureModal } from '../../atoms/modals/AreYouSureModal';
import { verbColors } from '../../../utils/style';
import { TabsContext } from '../../../managers/GlobalContextManager';
import { SprocketTooltip } from '../../atoms/SprocketTooltip';
import { useSelector } from 'react-redux';
import { selectActiveState } from '../../../state/active/selectors';
import { useAppDispatch } from '../../../state/store';
import { addNewEndpoint, deleteEndpoint } from '../../../state/active/thunks/endpoints';
import { addNewRequest } from '../../../state/active/thunks/requests';
import { setsAreEqual } from '../../../utils/math';
import { log } from '../../../utils/logging';

interface DumbEndpointFileSystemProps {
	collapsed: boolean;
	setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
	menuOpen: boolean;
	setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
	deleteModalOpen: boolean;
	setDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	requests: EndpointRequest[];
	isTabSelected: boolean;
	endpoint: Endpoint;
}
const DumbEndpointFileSystem = ({
	menuOpen,
	setCollapsed,
	setDeleteModalOpen,
	setMenuOpen,
	collapsed,
	deleteModalOpen,
	requests,
	isTabSelected,
	endpoint,
}: DumbEndpointFileSystemProps) => {
	const dispatch = useAppDispatch();
	const tabsContext = useContext(TabsContext);

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
							dispatch(addNewEndpoint({ data: endpoint, serviceId: endpoint.serviceId }));
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
							dispatch(addNewRequest({ endpointId: endpoint.id }));
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
				selected={isTabSelected}
			>
				<ListItemDecorator>
					<SprocketTooltip text={collapsed ? 'Expand' : 'Collapse'}>
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
					</SprocketTooltip>
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
					requests.map((request: EndpointRequest, index) => <RequestFileSystem request={request} key={index} />)}
			</List>
			<AreYouSureModal
				action={`delete '${endpoint.name}' and all its data`}
				open={deleteModalOpen}
				closeFunc={() => setDeleteModalOpen(false)}
				actionFunc={() => dispatch(deleteEndpoint(endpoint.id))}
			/>
		</ListItem>
	);
};

const MemoizedDumbEndpointFileSystem = memo(DumbEndpointFileSystem);

function EndpointFileSystem({ endpoint, validIds }: { endpoint: Endpoint; validIds: Set<string> }) {
	const tabsContext = useContext(TabsContext);
	const { tabs } = tabsContext;
	const [collapsed, setCollapsed] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const data = useSelector(selectActiveState);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);

	return (
		<MemoizedDumbEndpointFileSystem
			{...{
				collapsed,
				setCollapsed,
				menuOpen,
				setMenuOpen,
				deleteModalOpen,
				setDeleteModalOpen,
				isTabSelected: tabs.selected === endpoint.id,
				endpoint,
				validIds,
				requests: data.endpoints[endpoint.id]?.requestIds
					.filter((requestId) => validIds.has(requestId))
					.map((requestIds) => data.requests[requestIds])
					.filter((x) => x != null)
					.sort((a, b) => a.name.localeCompare(b.name)),
			}}
		/>
	);
}

export const MemoizedEndpointFileSystem = memo(EndpointFileSystem, (prevProps, nextProps) => {
	// check set equality first
	if (!setsAreEqual(prevProps.validIds, nextProps.validIds)) {
		log.info('Re-rendering because validIds are not equals');
		return false;
	}
	// check if anything that could affect file system rendering has changed
	if (prevProps.endpoint.name !== nextProps.endpoint.name) {
		log.info('Re-rendering because endpoint has changed');
		return false;
	}

	if (!setsAreEqual(new Set(prevProps.endpoint.requestIds), new Set(nextProps.endpoint.requestIds))) {
		log.info('Re-rendering because request ids have changed');

		return false;
	}

	if (prevProps.endpoint.defaultRequest !== nextProps.endpoint.defaultRequest) {
		log.info('Re-rendering because default request has changed');

		return false;
	}

	return true;
});
