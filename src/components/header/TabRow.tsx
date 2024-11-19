import { TabList, tabClasses } from '@mui/joy';
import { TabType } from '../../types/state/state';
import { Tab } from './Tab';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';

interface TabRowProps {
	list: Record<string, TabType>;
}

export function TabRow({ list }: TabRowProps) {
	const ref = useHorizontalScroll();
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
				overflowX: 'auto',
				overflowY: 'hidden',
				scrollSnapType: 'x mandatory',
				[`& .${tabClasses.root}`]: {
					'&[aria-selected="true"]': {
						color: `secondary.500`,
						bgcolor: 'background.surface',
						borderColor: 'divider',
						outline: 'none',
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
			{Object.entries(list).map((tab, index) => (
				<Tab tab={tab} key={index} />
			))}
		</TabList>
	);
}
