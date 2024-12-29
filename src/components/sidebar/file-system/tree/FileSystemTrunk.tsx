import { selectSettings } from '@/state/active/selectors';
import { List } from '@mui/joy';
import { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { LIST_STYLES } from '@/styles/list';

export function FileSystemTrunk({ children }: PropsWithChildren) {
	const style = LIST_STYLES[useSelector(selectSettings).theme.list];
	return (
		<List
			size={style.size}
			aria-labelledby="nav-list-browse"
			sx={{
				p: 1,
				'--ListItem-radius': '8px',
				'--List-gap': style.gap,
				'--List-nestedInsetStart': style.inset,
				'& .JoyListItemButton-root': { p: '8px' },
			}}
		>
			{children}
		</List>
	);
}
