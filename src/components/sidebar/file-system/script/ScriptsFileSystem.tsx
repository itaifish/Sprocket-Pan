import { Box, ListDivider } from '@mui/joy';
import { ScriptFileSystem } from './ScriptFileSystem';
import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import { selectScripts } from '../../../../state/active/selectors';
import { SearchField } from '../../../shared/SearchField';
import { FileSystemSection } from '../FileSystemSection';
import { searchScripts } from '../../../../utils/search';

export function ScriptsFileSystem() {
	const scripts = useSelector(selectScripts);
	const [searchText, setSearchText] = useState('');

	const filteredScriptIds = useMemo(() => searchScripts(scripts, searchText), [scripts, searchText]);

	return (
		<FileSystemSection header="Scripts" actions={<SearchField onChange={(text) => setSearchText(text)} />}>
			{filteredScriptIds.map((scriptId, index) => (
				<Box key={index}>
					{index !== 0 && <ListDivider />}
					<ScriptFileSystem scriptId={scriptId} />
				</Box>
			))}
		</FileSystemSection>
	);
}
