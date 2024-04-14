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
import { Environment } from '../../../types/application-data/application-data';
import { tabsManager } from '../../../managers/TabsManager';
import { keepStringLengthReasonable } from '../../../utils/string';
import { useContext, useState } from 'react';
import TableChartIcon from '@mui/icons-material/TableChart';
import { MoreVert } from '@mui/icons-material';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { AreYouSureModal } from '../../atoms/modals/AreYouSureModal';
import { TabsContext } from '../../../managers/GlobalContextManager';
import { selectActiveState } from '../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../state/store';
import { addNewEnvironment, deleteEnvironment } from '../../../state/active/thunks/environments';

export function EnvironmentFileSystem({ environment }: { environment: Environment }) {
	const tabsContext = useContext(TabsContext);
	const data = useSelector(selectActiveState);
	const { tabs } = tabsContext;
	const selected = tabs.selected === environment.__id;
	const [menuOpen, setMenuOpen] = useState(false);
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
							dispatch(addNewEnvironment({ data: environment }));
						}}
					>
						<ListItemDecorator>
							<IconButton aria-label="copy environment" size="sm">
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
							<IconButton aria-label="delete environment" size="sm">
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
			<ListItem nested endAction={menuButton}>
				<ListItemButton
					onClick={() => {
						tabsManager.selectTab(tabsContext, environment.__id, 'environment');
					}}
					selected={selected}
					color={data.selectedEnvironment === environment.__id ? 'success' : 'neutral'}
				>
					<ListItemDecorator>
						<TableChartIcon fontSize="small" />
					</ListItemDecorator>
					<ListSubheader>{keepStringLengthReasonable(environment.__name)}</ListSubheader>
				</ListItemButton>
			</ListItem>
			<AreYouSureModal
				action={`delete '${environment.__name}' and all its data`}
				open={deleteModalOpen}
				closeFunc={() => setDeleteModalOpen(false)}
				actionFunc={() => dispatch(deleteEnvironment(environment.__id))}
			/>
		</>
	);
}
