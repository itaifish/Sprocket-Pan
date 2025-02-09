import { Button, ColorPaletteProp, Stack } from '@mui/joy';
import { ReactNode, useState } from 'react';

interface Tab {
	title: string;
	icon?: ReactNode;
	color?: ColorPaletteProp;
	content?: ReactNode;
}

interface ButtonTabsProps {
	tabs: Tab[];
	onChange?: (index: number, oldIndex: number) => void;
}

export function ButtonTabs({ tabs, onChange }: ButtonTabsProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const switchTab = (index: number) => {
		if (index === activeIndex) {
			//if only two, toggle between them. if more, out of luck
			if (tabs.length === 2) {
				const newIndex = activeIndex ? 0 : 1;
				onChange?.(newIndex, activeIndex);
				setActiveIndex(newIndex);
			}
		} else {
			onChange?.(index, activeIndex);
			setActiveIndex(index);
		}
	};
	return (
		<>
			<Stack direction="row" maxWidth="100%" minWidth={`${125 * tabs.length}px`} width={`${200 * tabs.length}px`}>
				{tabs.map(({ title, icon, color }, index) => (
					<Button
						key={title}
						sx={{
							clipPath: index === 0 ? '' : 'polygon(30px 0, 100% 0, 100% 100%, 0 100%)',
							ml: index === 0 ? 0 : '-30px',
							height: '30px',
							width: '100%',
							borderRadius: 0,
						}}
						variant="soft"
						startDecorator={icon}
						color={activeIndex === index ? (color ?? 'primary') : 'neutral'}
						onClick={() => switchTab(index)}
					>
						{title}
					</Button>
				))}
			</Stack>
			{tabs[activeIndex].content}
		</>
	);
}
