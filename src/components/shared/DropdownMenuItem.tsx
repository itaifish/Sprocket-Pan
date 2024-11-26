import { MenuItem, MenuItemProps } from '@mui/joy';

export function DropdownMenuItem({ sx, ...props }: MenuItemProps) {
	return <MenuItem sx={{ pr: 3, ...sx }} {...props} />;
}
