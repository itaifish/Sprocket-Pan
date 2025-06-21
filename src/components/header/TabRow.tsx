import { TabList, tabClasses, useTheme } from '@mui/joy';
import { Tab } from './Tab';
import { useScrollbarTheme } from '@/hooks/useScrollbarTheme';
import { useSingleAxisScroll } from '@/hooks/useSingleAxisScroll';

interface TabRowProps {
	list: string[];
}

export function TabRow({ list }: TabRowProps) {
	const ref = useSingleAxisScroll();
	const { average: scrollbarTheme } = useScrollbarTheme();
	const theme = useTheme();
	return (
		<TabList
			ref={ref}
			tabFlex="1"
			sticky="top"
			underlinePlacement="bottom"
			variant="soft"
			disableUnderline
			id="tabScroll"
			sx={{
				...scrollbarTheme,
				backgroundColor: theme.palette.background.level2,
				zIndex: 110,
				overflowX: 'auto',
				overflowY: 'hidden',
				scrollSnapType: 'x mandatory',
				maxHeight: '45px',
				boxSizing: 'border-box',
				[`& .${tabClasses.root}`]: {
					'&[aria-selected="true"]': {
						color: `secondary.500`,
						bgcolor: 'background.surface',
						borderColor: 'divider',
						'&::before': {
							content: '""',
							display: 'block',
							position: 'absolute',
							height: 2,
							bottom: -2,
							left: 0,
							right: 0,
							bgcolor: 'background.surface',
						},
					},
				},
			}}
		>
			{list.map((id) => (
				<Tab key={id} id={id} />
			))}
		</TabList>
	);
}
