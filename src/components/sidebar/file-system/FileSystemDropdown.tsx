import { IconButton, ListItemDecorator, Menu, Dropdown, MenuButton } from '@mui/joy';
import { MoreVert } from '@mui/icons-material';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useState } from 'react';
import { DropdownMenuItem } from '../../shared/DropdownMenuItem';

export interface FileSystemMenuOption {
	label: string;
	onClick: () => void;
	Icon: any;
}

interface FileSystemMenuOptionProps extends FileSystemMenuOption {
	closeMenu: () => void;
}

export function FileSystemMenuOption({ label, onClick, Icon, closeMenu }: FileSystemMenuOptionProps) {
	return (
		<DropdownMenuItem
			onClick={() => {
				closeMenu();
				onClick();
			}}
			sx={{ pr: 3 }}
		>
			<ListItemDecorator>
				<IconButton size="sm">
					<Icon fontSize="small" />
				</IconButton>
				{label}
			</ListItemDecorator>
		</DropdownMenuItem>
	);
}

export function menuOptionDuplicate(onClick: () => void) {
	return {
		Icon: FolderCopyIcon,
		label: 'Duplicate',
		onClick,
	};
}

export function menuOptionDelete(onClick: () => void) {
	return {
		Icon: DeleteForeverIcon,
		label: 'Delete',
		onClick,
	};
}

interface FileSystemDropdownProps {
	options: FileSystemMenuOption[];
}

export function FileSystemDropdown({ options }: FileSystemDropdownProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const closeMenu = () => setMenuOpen(false);

	return (
		<Dropdown open={menuOpen} onOpenChange={(_event, isOpen) => setMenuOpen(isOpen)}>
			<MenuButton slots={{ root: IconButton }} slotProps={{ root: { variant: 'plain', color: 'neutral' } }}>
				<MoreVert />
			</MenuButton>
			<Menu sx={{ zIndex: 1201 }}>
				{options.map((option) => (
					<FileSystemMenuOption key={option.label} closeMenu={closeMenu} {...option} />
				))}
			</Menu>
		</Dropdown>
	);
}
