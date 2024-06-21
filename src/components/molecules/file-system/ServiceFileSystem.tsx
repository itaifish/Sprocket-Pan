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
import FolderOpenSharpIcon from '@mui/icons-material/FolderOpenSharp';
import FolderSharpIcon from '@mui/icons-material/FolderSharp';
import { useState, memo } from 'react';
import { Endpoint, Service } from '../../../types/application-data/application-data';
import { keepStringLengthReasonable } from '../../../utils/string';
import { MemoizedEndpointFileSystem as EndpointFileSystem } from './EndpointFileSystem';
import { MoreVert } from '@mui/icons-material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { AreYouSureModal } from '../../atoms/modals/AreYouSureModal';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import { SprocketTooltip } from '../../atoms/SprocketTooltip';
import { useSelector } from 'react-redux';
import { selectActiveState } from '../../../state/active/selectors';
import { useAppDispatch } from '../../../state/store';
import { addNewEndpoint } from '../../../state/active/thunks/endpoints';
import { cloneService, deleteService } from '../../../state/active/thunks/services';
import { addTabs, setSelectedTab } from '../../../state/tabs/slice';
import { selectActiveTab } from '../../../state/tabs/selectors';

interface DumbServiceFileSystemProps {
	collapsed: boolean;
	setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
	menuOpen: boolean;
	setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
	deleteModalOpen: boolean;
	setDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	endpoints: Endpoint[];
	isTabSelected: boolean;
	service: Service;
	validIds: Set<string>;
}

const DumbServiceFileSystem = ({
	collapsed,
	setCollapsed,
	menuOpen,
	setMenuOpen,
	deleteModalOpen,
	setDeleteModalOpen,
	endpoints,
	isTabSelected,
	service,
	validIds,
}: DumbServiceFileSystemProps) => {
	const dispatch = useAppDispatch();

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
							dispatch(cloneService({ data: service }));
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
							dispatch(addNewEndpoint({ serviceId: service.id }));
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
					dispatch(addTabs({ [service.id]: 'service' }));
					dispatch(setSelectedTab(service.id));
				}}
				selected={isTabSelected}
			>
				<ListItemDecorator>
					<SprocketTooltip text={collapsed ? 'Expand' : 'Collapse'}>
						<IconButton
							onClick={(e) => {
								setCollapsed((wasCollapsed) => !wasCollapsed);
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							{collapsed ? <FolderSharpIcon fontSize="small" /> : <FolderOpenSharpIcon fontSize="small" />}
						</IconButton>
					</SprocketTooltip>
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
					endpoints.map((endpoint, index) => (
						<EndpointFileSystem endpoint={endpoint} validIds={validIds} key={index} />
					))}
			</List>
			<AreYouSureModal
				action={`delete '${service.name}' and all its data`}
				open={deleteModalOpen}
				closeFunc={() => setDeleteModalOpen(false)}
				actionFunc={() => dispatch(deleteService(service.id))}
			/>
		</ListItem>
	);
};

const MemoizedDumbServiceFileSystem = memo(DumbServiceFileSystem);

export function ServiceFileSystem({ service, validIds }: { service: Service; validIds: Set<string> }) {
	const [collapsed, setCollapsed] = useState(false);
	const data = useSelector(selectActiveState);
	const [menuOpen, setMenuOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const selectedTabId = useSelector(selectActiveTab);

	return (
		<MemoizedDumbServiceFileSystem
			{...{
				collapsed,
				setCollapsed,
				menuOpen,
				setMenuOpen,
				deleteModalOpen,
				setDeleteModalOpen,
				isTabSelected: selectedTabId === service.id,
				service,
				validIds,
				endpoints: service.endpointIds
					.filter((endpointId) => validIds.has(endpointId))
					.map((endpointId) => data.endpoints[endpointId])
					.filter((x) => x != null)
					.sort((a, b) => a.name.localeCompare(b.name)),
			}}
		/>
	);
}
