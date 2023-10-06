import { Dropdown, IconButton, ListItemDecorator, Menu, MenuButton, MenuItem } from '@mui/joy';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useState } from 'react';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import TableChartIcon from '@mui/icons-material/TableChart';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';

export function NewButton() {
	const [menuOpen, setMenuOpen] = useState(false);
	return (
		<Dropdown open={menuOpen} onOpenChange={(_event, isOpen) => setMenuOpen(isOpen)}>
			<MenuButton slots={{ root: IconButton }} slotProps={{ root: { variant: 'soft', color: 'neutral', size: 'sm' } }}>
				<AddBoxIcon />
			</MenuButton>
			<Menu>
				<MenuItem
					onClick={() => {
						applicationDataManager.addNew('service', undefined);
						setMenuOpen(false);
					}}
				>
					<ListItemDecorator>
						<IconButton aria-label="Create new service" size="sm">
							<CreateNewFolderIcon fontSize="small" />
						</IconButton>
						New Service
					</ListItemDecorator>
				</MenuItem>
				<MenuItem
					onClick={() => {
						applicationDataManager.addNew('environment', undefined);
						setMenuOpen(false);
					}}
				>
					<ListItemDecorator>
						<IconButton aria-label="add new request" size="sm">
							<TableChartIcon fontSize="small" />
						</IconButton>
						New Environment
					</ListItemDecorator>
				</MenuItem>
			</Menu>
		</Dropdown>
	);
}
