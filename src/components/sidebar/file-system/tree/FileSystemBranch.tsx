import { Box, IconButton, List, ListItem, ListItemDecorator } from '@mui/joy';
import { FileSystemLeafProps } from './FileSystemLeaf';
import { FileSystemButton } from './FileSystemButton';
import { selectSettings, selectUiMetadataById } from '../../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { LIST_STYLING } from '../../../../styles/list';
import { useAppDispatch } from '../../../../state/store';
import { SprocketTooltip } from '../../../shared/SprocketTooltip';
import { Folder, FolderOpen } from '@mui/icons-material';
import { setUiMetadataById } from '../../../../state/active/slice';

interface FileSystemBranchProps extends FileSystemLeafProps {
	buttonContent: React.ReactNode;
	folderSize?: 'md' | 'sm';
}

export function FileSystemBranch({
	buttonContent,
	children,
	menuOptions,
	tabType,
	id,
	folderSize = 'md',
}: FileSystemBranchProps) {
	const style = LIST_STYLING[useSelector(selectSettings).listStyle];
	const dispatch = useAppDispatch();
	const collapsed = useSelector((state) => selectUiMetadataById(state, id))?.collapsed ?? false;
	const setCollapsed = (value: boolean) => {
		dispatch(setUiMetadataById({ id: id, collapsed: value }));
	};
	return (
		<>
			<Box id={`file_${id}`} />
			<ListItem nested>
				<FileSystemButton tabType={tabType} id={id} menuOptions={menuOptions}>
					<ListItemDecorator>
						<SprocketTooltip text={collapsed ? 'Expand' : 'Collapse'}>
							<IconButton
								size={folderSize}
								onClick={(e) => {
									setCollapsed(!collapsed);
									e.preventDefault();
									e.stopPropagation();
								}}
							>
								{collapsed ? <Folder fontSize="small" /> : <FolderOpen fontSize="small" />}
							</IconButton>
						</SprocketTooltip>
					</ListItemDecorator>
					{buttonContent}
				</FileSystemButton>
				<List
					aria-labelledby="nav-list-browse"
					sx={{
						'--List-nestedInsetStart': style.inset,
					}}
				>
					{!collapsed && children}
				</List>
			</ListItem>
		</>
	);
}
