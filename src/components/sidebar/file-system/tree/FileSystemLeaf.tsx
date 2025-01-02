import { Box, ListItem, ListItemButton } from '@mui/joy';
import { selectIsActiveTab } from '@/state/tabs/selectors';
import { tabsActions } from '@/state/tabs/slice';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/state/store';
import { PropsWithChildren } from 'react';
import { TabType } from '@/types/state/state';
import { FileSystemDropdown, FileSystemMenuOption } from '../FileSystemDropdown';

export interface FileSystemLeafProps extends PropsWithChildren {
	id: string;
	tabType: TabType;
	color?: 'success' | 'primary' | 'neutral';
	menuOptions?: FileSystemMenuOption[];
}

export function FileSystemLeaf({ id, menuOptions, children, tabType, color = 'neutral' }: FileSystemLeafProps) {
	const dispatch = useAppDispatch();
	const isSelected = useSelector((state) => selectIsActiveTab(state, id));
	return (
		<>
			<Box id={`file_${id}`} />
			<ListItem nested endAction={menuOptions == null ? null : <FileSystemDropdown options={menuOptions} />}>
				<ListItemButton
					onClick={() => {
						dispatch(tabsActions.addTabs({ [id]: tabType }));
						dispatch(tabsActions.setSelectedTab(id));
					}}
					selected={isSelected}
					color={color}
				>
					{children}
				</ListItemButton>
			</ListItem>
		</>
	);
}
