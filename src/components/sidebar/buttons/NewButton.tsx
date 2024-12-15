import { Box, Dropdown, IconButton, ListItemDecorator, Menu, MenuButton } from '@mui/joy';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useRef, useState } from 'react';
import CreateNewFolderSharpIcon from '@mui/icons-material/CreateNewFolderSharp';
import TableChartIcon from '@mui/icons-material/TableChart';
import CodeIcon from '@mui/icons-material/Code';
import { DropdownMenuItem } from '@/components/shared/DropdownMenuItem';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { useClickOutsideAlerter } from '@/hooks/useClickOutsideAlerter';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';

export function NewButton() {
	const [menuOpen, setMenuOpen] = useState(false);
	const dispatch = useAppDispatch();
	const ref = useRef<HTMLInputElement>(null);
	useClickOutsideAlerter({ ref, onOutsideClick: () => setMenuOpen(false) });

	const newEntities = [
		{
			name: 'Service',
			createFunc: () => tabsActions.addToCreateQueue('service'),
			icon: <CreateNewFolderSharpIcon fontSize="small" />,
		},
		{
			name: 'Environment',
			createFunc: () => tabsActions.addToCreateQueue('environment'),
			icon: <TableChartIcon fontSize="small" />,
		},
		{
			name: 'Script',
			createFunc: () => tabsActions.addToCreateQueue('script'),
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
					<Menu ref={ref}>
						{newEntities.map((entity, index) => (
							<Box key={index}>
								<DropdownMenuItem
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
								</DropdownMenuItem>
							</Box>
						))}
					</Menu>
				</Dropdown>
			</Box>
		</SprocketTooltip>
	);
}
