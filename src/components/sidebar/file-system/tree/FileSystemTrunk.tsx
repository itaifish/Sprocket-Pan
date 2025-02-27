import { useScrollbarTheme } from '@/hooks/useScrollbarTheme';
import { selectSettings } from '@/state/active/selectors';
import { Item } from '@/types/data/item';
import { Box, useTheme } from '@mui/joy';
import { Fragment, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Virtuoso } from 'react-virtuoso';

interface FileSystemTrunkProps<T> {
	items: T[];
	render: (item: T, index: number) => ReactNode;
}

export function FileSystemTrunk<T extends Item>({ items, render }: FileSystemTrunkProps<T>) {
	const { average } = useScrollbarTheme();
	const {
		virtualization: { enabled },
	} = useSelector(selectSettings);
	const theme = useTheme();
	return (
		<Box
			component="ul"
			sx={{
				flex: 1,
				minHeight: '1px',
				'& button': {
					':hover': { backgroundColor: 'transparent' },
					border: 'none',
					backgroundColor: 'transparent',
					cursor: 'pointer',
					color: theme.palette.text.secondary,
				},
				'& li': {
					display: 'flex',
					width: '100%',
					justifyContent: 'stretch',
					alignItems: 'center',
					listStyle: 'none',
					m: 0,
					p: 0,
					':hover': { backgroundColor: theme.palette.background.level2 },
					':active': { backgroundColor: theme.palette.background.level3 },
				},
				'& .selected': {
					backgroundColor: theme.palette.background.level1,
				},
				'& .onHoverContainer': {
					':hover': {
						'.onHoverButton': {
							opacity: '1 !important',
						},
					},
				},
				'& ul': {
					ml: 1,
					pl: 1,
					transition: 'all 0.1s',
					borderLeft: '1px solid transparent',
					':hover': { borderLeft: '1px solid ' + theme.palette.background.level2 },
				},
				p: 0,
				pl: 1,
				m: 0,
			}}
		>
			{enabled ? (
				<Virtuoso style={average as any} data={items} itemContent={(index, item) => render(item, index)} />
			) : (
				<Box sx={{ ...average, height: '100%', overflow: 'auto' }}>
					{items.map((item, index) => (
						<Fragment key={item.id}>{render(item, index)}</Fragment>
					))}
				</Box>
			)}
		</Box>
	);
}
