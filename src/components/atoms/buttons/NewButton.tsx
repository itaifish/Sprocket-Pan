import { Box, Dropdown, IconButton, ListItemDecorator, Menu, MenuButton, MenuItem } from '@mui/joy';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useState } from 'react';
import CreateNewFolderSharpIcon from '@mui/icons-material/CreateNewFolderSharp';
import TableChartIcon from '@mui/icons-material/TableChart';
import { SprocketTooltip } from '../SprocketTooltip';
import { useAppDispatch } from '../../../state/store';
import { addNewEnvironment } from '../../../state/active/thunks/environments';
import { addNewService } from '../../../state/active/thunks/services';

export function NewButton() {
	const [menuOpen, setMenuOpen] = useState(false);
	const dispatch = useAppDispatch();
	return (
		<SprocketTooltip text="Create New" disabled={menuOpen}>
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
								dispatch(addNewService({}));
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
								dispatch(addNewEnvironment({}));
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
