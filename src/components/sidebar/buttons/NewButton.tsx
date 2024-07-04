import { Box, Dropdown, IconButton, ListItemDecorator, Menu, MenuButton, MenuItem } from '@mui/joy';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useState } from 'react';
import CreateNewFolderSharpIcon from '@mui/icons-material/CreateNewFolderSharp';
import TableChartIcon from '@mui/icons-material/TableChart';
import { generate } from 'random-words';
import CodeIcon from '@mui/icons-material/Code';
import { addScript } from '../../../state/active/slice';
import { addNewEnvironment } from '../../../state/active/thunks/environments';
import { cloneService } from '../../../state/active/thunks/services';
import { useAppDispatch } from '../../../state/store';
import { SprocketTooltip } from '../../shared/SprocketTooltip';

export function NewButton() {
	const [menuOpen, setMenuOpen] = useState(false);
	const dispatch = useAppDispatch();
	const newEntities = [
		{ name: 'Service', createFunc: () => cloneService({}), icon: <CreateNewFolderSharpIcon fontSize="small" /> },
		{
			name: 'Environment',
			createFunc: () => addNewEnvironment({}),
			icon: <TableChartIcon fontSize="small" />,
		},
		{
			name: 'Script',
			createFunc: () => addScript({ scriptName: `${generate()} ${generate()} ${generate()}`, scriptContent: '' }),
			icon: <CodeIcon fontSize="small" />,
		},
	];

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
						{newEntities.map((entity, index) => (
							<Box key={index}>
								<MenuItem
									onClick={() => {
										dispatch(entity.createFunc());
										setMenuOpen(false);
									}}
								>
									<ListItemDecorator>
										<IconButton aria-label={`Create New ${entity.name}`} size="sm">
											{entity.icon}
										</IconButton>
										New {entity.name}
									</ListItemDecorator>
								</MenuItem>
							</Box>
						))}
					</Menu>
				</Dropdown>
			</Box>
		</SprocketTooltip>
	);
}
