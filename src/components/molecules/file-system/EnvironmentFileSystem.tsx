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
import { keepStringLengthReasonable } from '../../../utils/string';
import { useState } from 'react';
import TableChartIcon from '@mui/icons-material/TableChart';
import { MoreVert } from '@mui/icons-material';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { AreYouSureModal } from '../../atoms/modals/AreYouSureModal';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../state/store';
import { addNewEnvironment, deleteEnvironment } from '../../../state/active/thunks/environments';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { selectEnvironment } from '../../../state/active/slice';
import { addTabs, setSelectedTab } from '../../../state/tabs/slice';
import { selectActiveTab } from '../../../state/tabs/selectors';
import { selectSelectedEnvironment } from '../../../state/active/selectors';

export function EnvironmentFileSystem({ environment }: { environment: Environment }) {
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const selectedTabId = useSelector(selectActiveTab);
	const selected = selectedTabId === environment.__id;
	const envSelected = selectedEnvironment === environment.__id;
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
							if (envSelected) {
								dispatch(selectEnvironment(undefined));
							} else {
								dispatch(selectEnvironment(environment.__id));
							}
						}}
					>
						<ListItemDecorator>
							<IconButton aria-label="Select" size="sm">
								<CheckCircleOutlinedIcon fontSize="small" />
							</IconButton>
							{envSelected ? 'Deselect' : 'Select'}
						</ListItemDecorator>
					</MenuItem>
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
						dispatch(addTabs({ [environment.__id]: 'environment' }));
						dispatch(setSelectedTab(environment.__id));
					}}
					selected={selected}
					color={envSelected ? 'success' : 'neutral'}
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
