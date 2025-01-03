import { selectIsActiveTab } from '@/state/tabs/selectors';
import { tabsActions } from '@/state/tabs/slice';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/state/store';
import { PropsWithChildren } from 'react';
import { TabType } from '@/types/state/state';
import { FileSystemDropdown, FileSystemMenuOption } from './FileSystemDropdown';

export interface FileSystemLeafProps extends PropsWithChildren {
	id: string;
	tabType: TabType;
	menuOptions?: FileSystemMenuOption[];
}

export function FileSystemLeaf({ id, menuOptions, children, tabType }: FileSystemLeafProps) {
	const dispatch = useAppDispatch();
	const isSelected = useSelector((state) => selectIsActiveTab(state, id));
	return (
		<li id={`file_${id}`} style={{ display: 'flex' }} className={isSelected ? 'selected' : undefined}>
			<button
				style={{ gap: '7px', display: 'flex', alignItems: 'center', flex: 1, minWidth: '50px' }}
				onClick={() => {
					dispatch(tabsActions.addTabs({ [id]: tabType }));
					dispatch(tabsActions.setSelectedTab(id));
				}}
			>
				{children}
			</button>
			{menuOptions == null ? null : <FileSystemDropdown options={menuOptions} />}
		</li>
	);
}
