import { selectIsActiveTab } from '@/state/ui/selectors';
import { uiActions } from '@/state/ui/slice';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/state/store';
import { PropsWithChildren } from 'react';
import { FileSystemDropdown, FileSystemMenuOption } from './FileSystemDropdown';

export interface FileSystemLeafProps extends PropsWithChildren {
	id: string;
	menuOptions?: FileSystemMenuOption[];
}

export function FileSystemLeaf({ id, menuOptions, children }: FileSystemLeafProps) {
	const dispatch = useAppDispatch();
	const isSelected = useSelector((state) => selectIsActiveTab(state, id));
	return (
		<li id={`file_${id}`} style={{ display: 'flex' }} className={isSelected ? 'selected' : undefined}>
			<button
				style={{ gap: '7px', display: 'flex', alignItems: 'center', flex: 1, minWidth: '50px' }}
				onClick={() => {
					dispatch(uiActions.addTab(id));
					dispatch(uiActions.setSelectedTab(id));
				}}
			>
				{children}
			</button>
			{menuOptions == null ? null : <FileSystemDropdown options={menuOptions} />}
		</li>
	);
}
