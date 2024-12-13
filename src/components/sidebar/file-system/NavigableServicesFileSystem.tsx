import { List, ListDivider } from '@mui/joy';
import { ScriptsFileSystem } from './script/ScriptsFileSystem';
import { EnvironmentsFileSystem } from './environment/EnvironmentsFileSystem';
import { ServicesFileSystem } from './service/ServicesFileSystem';
import { useSelector } from 'react-redux';
import { selectSettings } from '@/state/active/selectors';
import { LIST_STYLES } from '@/styles/list';

export function NavigableServicesFileSystem() {
	const style = LIST_STYLES[useSelector(selectSettings).theme.list];
	return (
		<>
			<List
				size={style.size}
				sx={{ '--ListItem-radius': '8px', '--List-gap': style.gap, '--List-nestedInsetStart': style.inset }}
			>
				<EnvironmentsFileSystem />
				<ListDivider />
				<ScriptsFileSystem />
				<ListDivider />
				<ServicesFileSystem />
			</List>
		</>
	);
}
