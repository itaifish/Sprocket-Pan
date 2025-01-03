import { FileSystemLeafProps } from './FileSystemLeaf';
import { useSelector } from 'react-redux';
import { selectUiMetadataById } from '@/state/active/selectors';
import { useAppDispatch } from '@/state/store';
import { FileSystemDropdown } from './FileSystemDropdown';
import { tabsActions } from '@/state/tabs/slice';
import { selectIsActiveTab } from '@/state/tabs/selectors';
import { CollapsibleFolder } from '../components/CollapsibleFolder';

interface FileSystemBranchProps extends FileSystemLeafProps {
	buttonContent: React.ReactNode;
}

export function FileSystemBranch({ buttonContent, children, menuOptions, tabType, id }: FileSystemBranchProps) {
	const dispatch = useAppDispatch();
	const collapsed = useSelector((state) => selectUiMetadataById(state, id))?.collapsed ?? false;
	const isSelected = useSelector((state) => selectIsActiveTab(state, id));
	return (
		<>
			<li id={`file_${id}`} className={isSelected ? 'selected' : undefined}>
				<CollapsibleFolder collapsed={collapsed} id={id} />
				<button
					style={{ gap: '7px', display: 'flex', alignItems: 'center', flex: 1, minWidth: '50px' }}
					onClick={() => {
						dispatch(tabsActions.addTabs({ [id]: tabType }));
						dispatch(tabsActions.setSelectedTab(id));
					}}
				>
					{buttonContent}
				</button>
				{menuOptions == null ? null : <FileSystemDropdown options={menuOptions} />}
			</li>
			{!collapsed && <ul>{children}</ul>}
		</>
	);
}
