import { IconButton, ListDivider, Stack, Typography } from '@mui/joy';
import { ScriptFileSystem } from './ScriptFileSystem';
import { useSelector } from 'react-redux';
import { Fragment, useMemo, useState } from 'react';
import { selectScripts } from '@/state/active/selectors';
import { searchScripts } from '@/utils/search';
import { FileSystemTrunk } from '../tree/FileSystemTrunk';
import { SearchField } from '@/components/shared/input/SearchField';
import { SideDrawerHeader } from '../../SideDrawerHeader';
import { useAppDispatch } from '@/state/store';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { uiActions } from '@/state/ui/slice';
import { AddBox } from '@mui/icons-material';
import { ItemType } from '@/types/data/item';

export function ScriptsFileSystem() {
	const scripts = useSelector(selectScripts);
	const [searchText, setSearchText] = useState('');
	const dispatch = useAppDispatch();

	const filteredScriptIds = useMemo(() => searchScripts(scripts, searchText), [scripts, searchText]);

	return (
		<>
			<SideDrawerHeader
				content="Scripts"
				actions={
					<Stack flexWrap="wrap" direction="row" justifyContent="end" alignItems="center" gap={1}>
						<SearchField onChange={setSearchText} />
						<SprocketTooltip text="Add New Script">
							<IconButton onClick={() => dispatch(uiActions.addToCreateQueue(ItemType.script))}>
								<AddBox />
							</IconButton>
						</SprocketTooltip>
					</Stack>
				}
			/>
			{filteredScriptIds.length === 0 && (
				<Typography textAlign="center" sx={{ width: '100%', mt: 4 }}>
					No scripts found.
				</Typography>
			)}
			<FileSystemTrunk>
				{filteredScriptIds.map((scriptId, index) => (
					<Fragment key={index}>
						{index !== 0 && <ListDivider />}
						<ScriptFileSystem scriptId={scriptId} />
					</Fragment>
				))}
			</FileSystemTrunk>
		</>
	);
}
