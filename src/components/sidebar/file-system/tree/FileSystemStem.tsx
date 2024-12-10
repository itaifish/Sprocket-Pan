import { Box, List, ListItem } from '@mui/joy';
import { FileSystemLeafProps } from './FileSystemLeaf';
import { FileSystemButton } from './FileSystemButton';
import { selectSettings } from '../../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { LIST_STYLING } from '../../../../styles/list';

interface FileSystemStemProps extends FileSystemLeafProps {
	buttonContent: React.ReactNode;
}

export function FileSystemStem({ buttonContent, children, menuOptions, tabType, id }: FileSystemStemProps) {
	const style = LIST_STYLING[useSelector(selectSettings).listStyle];
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
						'--List-nestedInsetStart': style.inset,
					}}
				>
					{children}
				</List>
			</ListItem>
		</>
	);
}
