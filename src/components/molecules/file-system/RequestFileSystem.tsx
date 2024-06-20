import {
	Dropdown,
	IconButton,
	ListItem,
	ListItemButton,
	ListItemDecorator,
	ListSubheader,
	Menu,
	MenuButton,
	MenuItem,
} from '@mui/joy';
import { EndpointRequest } from '../../../types/application-data/application-data';
import { memo, useContext, useState } from 'react';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { keepStringLengthReasonable } from '../../../utils/string';
import { tabsManager } from '../../../managers/TabsManager';
import { MoreVert } from '@mui/icons-material';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { AreYouSureModal } from '../../atoms/modals/AreYouSureModal';
import { TabsContext } from '../../../managers/GlobalContextManager';
import { selectActiveState } from '../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../state/store';
import { addNewRequest, deleteRequest } from '../../../state/active/thunks/requests';

function RequestFileSystem({ request }: { request: EndpointRequest }) {
	const tabsContext = useContext(TabsContext);
	const { tabs } = tabsContext;
	const data = useSelector(selectActiveState);
	const [menuOpen, setMenuOpen] = useState(false);
	const endpointData = data.endpoints[request.endpointId];
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const dispatch = useAppDispatch();

	const menuButton = (
		<>
			<Dropdown open={menuOpen} onOpenChange={(_event, isOpen) => setMenuOpen(isOpen)}>
				<MenuButton slots={{ root: IconButton }} slotProps={{ root: { variant: 'plain', color: 'neutral' } }}>
					<MoreVert />
				</MenuButton>
				<Menu>
					<MenuItem
						onClick={() => {
							setMenuOpen(false);
							dispatch(addNewRequest({ endpointId: request.endpointId, data: request }));
						}}
					>
						<ListItemDecorator>
							<IconButton aria-label="copy request" size="sm">
								<FolderCopyIcon fontSize="small" />
							</IconButton>
							Duplicate
						</ListItemDecorator>
					</MenuItem>
					<MenuItem
						onClick={() => {
							setMenuOpen(false);
							setDeleteModalOpen(true);
						}}
					>
						<ListItemDecorator>
							<IconButton aria-label="delete request" size="sm">
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
		<>
			<ListItem nested endAction={<>{menuButton}</>}>
				<ListItemButton
					onClick={() => {
						tabsManager.selectTab(tabsContext, request.id, 'request');
					}}
					selected={tabs.selected === request.id}
					color={endpointData.defaultRequest === request.id ? 'primary' : 'neutral'}
				>
					<ListItemDecorator>
						<TextSnippetIcon fontSize="small" />
					</ListItemDecorator>
					<ListSubheader>{keepStringLengthReasonable(request.name)}</ListSubheader>
				</ListItemButton>
			</ListItem>
			<AreYouSureModal
				action={`delete '${request.name}' and all its data`}
				open={deleteModalOpen}
				closeFunc={() => setDeleteModalOpen(false)}
				actionFunc={() => dispatch(deleteRequest(request.id))}
			/>
		</>
	);
}

export const MemoizedRequestFileSystem = memo(RequestFileSystem);
