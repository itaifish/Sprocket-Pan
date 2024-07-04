import { List, ListDivider } from '@mui/joy';
import { EnvironmentsFileSystem } from './environment/EnvironmentsFileSystem';
import { ScriptsFileSystem } from './script/ScriptsFileSystem';
import { ServicesFileSystem } from './service/ServicesFileSystem';

export function NavigableServicesFileSystem() {
	return (
		<>
			<List size="sm" sx={{ '--ListItem-radius': '8px', '--List-gap': '4px', '--List-nestedInsetStart': '1rem' }}>
				<EnvironmentsFileSystem />
				<ListDivider />
				<ScriptsFileSystem />
				<ListDivider />
				<ServicesFileSystem />
			</List>
		</>
	);
}
