import { Box, Dropdown, IconButton, ListItemDecorator, Menu, MenuButton, MenuItem } from '@mui/joy';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useState } from 'react';
import CreateNewFolderSharpIcon from '@mui/icons-material/CreateNewFolderSharp';
import TableChartIcon from '@mui/icons-material/TableChart';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { SprocketTooltip } from '../SprocketTooltip';

export function NewButton() {
	const [menuOpen, setMenuOpen] = useState(false);
	return (
		<SprocketTooltip text="Create New">
			<Box>
				<Dropdown open={menuOpen} onOpenChange={(_event, isOpen) => setMenuOpen(isOpen)}>
					<MenuButton
						slots={{ root: IconButton }}
						slotProps={{ root: { variant: 'soft', color: 'neutral', size: 'sm' } }}
					>
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
									<CreateNewFolderSharpIcon fontSize="small" />
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
								<IconButton aria-label="add new environment" size="sm">
									<TableChartIcon fontSize="small" />
								</IconButton>
								New Environment
							</ListItemDecorator>
						</MenuItem>
					</Menu>
				</Dropdown>
			</Box>
		</SprocketTooltip>
	);
}
