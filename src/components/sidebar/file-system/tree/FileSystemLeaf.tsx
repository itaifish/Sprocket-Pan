import { selectIsActiveTab } from '@/state/ui/selectors';
import { uiActions } from '@/state/ui/slice';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/state/store';
import { PropsWithChildren } from 'react';
import { FileSystemMenuOption } from './FileSystemDropdown';
import { FileSystemEntry } from './FileSystemEntry';

export interface FileSystemLeafProps extends PropsWithChildren {
	id: string;
	menuOptions?: FileSystemMenuOption[];
	color?: string;
}

export function FileSystemLeaf({ id, menuOptions, children, color }: FileSystemLeafProps) {
	const dispatch = useAppDispatch();
	const isSelected = useSelector((state) => selectIsActiveTab(state, id));
	return (
		<FileSystemEntry id={id} menuOptions={menuOptions} isSelected={isSelected}>
			<button
				style={{ gap: '7px', display: 'flex', alignItems: 'center', flex: 1, minWidth: '50px', color }}
				onClick={() => {
					dispatch(uiActions.addTab(id));
					dispatch(uiActions.setSelectedTab(id));
				}}
			>
				{children}
			</button>
		</FileSystemEntry>
	);
}
