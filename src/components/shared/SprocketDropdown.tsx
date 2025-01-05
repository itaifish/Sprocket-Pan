import { Dropdown, IconButton, Menu, MenuButton, MenuItem } from '@mui/joy';
import { PropsWithChildren, useState } from 'react';

export interface MenuOption {
	label: string;
	onClick: () => void;
	Icon: any;
}

interface SprocketDropdownProps extends PropsWithChildren {
	options: MenuOption[];
}

export function SprocketDropdown({ children, options }: SprocketDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<Dropdown open={isOpen} onOpenChange={(_, val) => setIsOpen(val)}>
			<MenuButton slots={{ root: IconButton }} slotProps={{ root: { variant: 'plain', color: 'neutral' } }}>
				{children}
			</MenuButton>
			<Menu sx={{ zIndex: 1201 }}>
				{options.map(({ label, onClick, Icon }) => (
					<MenuItem
						key={label}
						onClick={() => {
							onClick();
							setIsOpen(false);
						}}
					>
						<Icon />
						{label}
					</MenuItem>
				))}
			</Menu>
		</Dropdown>
	);
}
