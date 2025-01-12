import { useScrollbarTheme } from '@/hooks/useScrollbarTheme';
import { Box, useTheme } from '@mui/joy';
import { Virtuoso, VirtuosoProps } from 'react-virtuoso';

export function FileSystemTrunk<D, C>(props: VirtuosoProps<D, C>) {
	const { average } = useScrollbarTheme();
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
			<Virtuoso style={average as any} {...props} />
		</Box>
	);
}
