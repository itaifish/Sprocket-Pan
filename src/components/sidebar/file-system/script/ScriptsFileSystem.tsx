import { Box, List, ListDivider, ListItem, ListSubheader } from '@mui/joy';
import { ScriptFileSystem } from './ScriptFileSystem';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { selectScripts } from '../../../../state/active/selectors';
import { CollapseExpandButton } from '../../buttons/CollapseExpandButton';

export function ScriptsFileSystem() {
	const scripts = useSelector(selectScripts);
	const [scriptsCollapsed, setScriptsCollapsed] = useState(false);

	return (
		<ListItem nested>
			<ListSubheader>
				Scripts
				<CollapseExpandButton collapsed={scriptsCollapsed} setCollapsed={setScriptsCollapsed} />
			</ListSubheader>
			<List
				aria-labelledby="nav-list-browse"
				sx={{
					'& .JoyListItemButton-root': { p: '8px' },
				}}
			>
				{!scriptsCollapsed &&
					Object.keys(scripts).map((scriptId, index) => (
						<Box key={index}>
							{index !== 0 && <ListDivider />}
							<ScriptFileSystem scriptId={scriptId} />
						</Box>
					))}
			</List>
		</ListItem>
	);
}
