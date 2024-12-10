import { Box, ListItemButton } from '@mui/joy';
import { PropsWithChildren } from 'react';
import { FileSystemDropdown, FileSystemMenuOption } from '../FileSystemDropdown';
import { useAppDispatch } from '../../../../state/store';
import { selectIsActiveTab } from '../../../../state/tabs/selectors';
import { useSelector } from 'react-redux';
import { TabType } from '../../../../types/state/state';
import { tabsActions } from '../../../../state/tabs/slice';
import { HoverDecorator } from '../../../shared/HoverDecorator';

export interface FileSystemButtonProps extends PropsWithChildren {
	id: string;
	tabType: TabType;
	color?: 'success' | 'primary' | 'neutral';
	menuOptions?: FileSystemMenuOption[];
}

export function FileSystemButton({ id, children, tabType, color = 'neutral', menuOptions }: FileSystemButtonProps) {
	const isSelected = useSelector((state) => selectIsActiveTab(state, id));
	const dispatch = useAppDispatch();
	return (
		<HoverDecorator
			endDecorator={
				menuOptions == null ? null : (
					<Box width="10px">
						<FileSystemDropdown options={menuOptions} />
					</Box>
				)
			}
			justifyContent="stretch"
			alignItems="center"
		>
			<ListItemButton
				sx={{ flex: 1 }}
				onClick={() => {
					dispatch(tabsActions.addTabs({ [id]: tabType }));
					dispatch(tabsActions.setSelectedTab(id));
				}}
				selected={isSelected}
				color={color}
			>
				{children}
			</ListItemButton>
		</HoverDecorator>
	);
}
