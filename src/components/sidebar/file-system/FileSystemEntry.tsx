import { Box, List, ListItem, ListItemButton, Stack } from '@mui/joy';
import { PropsWithChildren } from 'react';
import { FileSystemDropdown, FileSystemMenuOption } from './FileSystemDropdown';
import { useAppDispatch } from '../../../state/store';
import { addTabs, setSelectedTab } from '../../../state/tabs/slice';
import { selectIsActiveTab } from '../../../state/tabs/selectors';
import { useSelector } from 'react-redux';
import { TabType } from '../../../types/state/state';

interface FileSystemButtonProps extends PropsWithChildren {
	id: string;
	tabType: TabType;
	color?: 'success' | 'primary' | 'neutral';
	menuOptions?: FileSystemMenuOption[];
}

export function FileSystemButton({ id, children, tabType, color = 'neutral', menuOptions }: FileSystemButtonProps) {
	const isSelected = useSelector((state) => selectIsActiveTab(state, id));
	const dispatch = useAppDispatch();
	return (
		<Stack
			direction="row"
			sx={{ ':hover': { '& .on-hover': { opacity: 100 } } }}
			justifyContent="stretch"
			alignItems="center"
		>
			<ListItemButton
				sx={{ flex: 1 }}
				onClick={() => {
					dispatch(addTabs({ [id]: tabType }));
					dispatch(setSelectedTab(id));
				}}
				selected={isSelected}
				color={color}
			>
				{children}
			</ListItemButton>
			{menuOptions == null ? null : (
				<Box className="on-hover" sx={{ opacity: 0, width: '10px' }}>
					<FileSystemDropdown options={menuOptions} />
				</Box>
			)}
		</Stack>
	);
}

interface FileSystemLeafProps extends FileSystemButtonProps {
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

interface FileSystemStemProps extends FileSystemLeafProps {
	buttonContent: React.ReactNode;
}

export function FileSystemStem({ buttonContent, children, menuOptions, tabType, id }: FileSystemStemProps) {
	return (
		<>
			<Box id={`file_${id}`} />
			<ListItem nested>
				<FileSystemButton tabType={tabType} id={id} menuOptions={menuOptions}>
					{buttonContent}
				</FileSystemButton>
				<List
					aria-labelledby="nav-list-browse"
					sx={{
						'& .JoyListItemButton-root': { p: '8px' },
						'--List-nestedInsetStart': '1rem',
					}}
				>
					{children}
				</List>
			</ListItem>
		</>
	);
}
