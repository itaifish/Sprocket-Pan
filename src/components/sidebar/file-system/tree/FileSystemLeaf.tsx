import { Box, ListItem } from '@mui/joy';
import { FileSystemMenuOption } from '../FileSystemDropdown';
import { FileSystemButton, FileSystemButtonProps } from './FileSystemButton';

export interface FileSystemLeafProps extends FileSystemButtonProps {
	menuOptions?: FileSystemMenuOption[];
}

export function FileSystemLeaf({ id, menuOptions, children, tabType, color = 'neutral' }: FileSystemLeafProps) {
	return (
		<>
			<Box id={`file_${id}`} />
			<ListItem nested>
				<FileSystemButton tabType={tabType} id={id} color={color} menuOptions={menuOptions}>
					{children}
				</FileSystemButton>
			</ListItem>
		</>
	);
}
