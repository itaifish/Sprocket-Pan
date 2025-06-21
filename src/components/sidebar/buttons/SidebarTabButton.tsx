import { PropsWithChildren } from 'react';
import { SidebarTabs } from '../types';
import { Box, IconButton, useTheme } from '@mui/joy';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';

export interface SidebarTabButtonProps extends PropsWithChildren {
	tab: SidebarTabs;
	setTab: (tab: SidebarTabs) => void;
	value: SidebarTabs;
	showActive?: boolean;
}

export function SidebarTabButton({ tab, setTab, value, children, showActive = true }: SidebarTabButtonProps) {
	const active = showActive && tab === value;
	const theme = useTheme();
	const primary = theme.palette.primary.outlinedBorder;
	const background = theme.palette.background.surface;
	return (
		<Box
			sx={{
				width: '100%',
				backgroundColor: active ? background : 'none',
				borderLeft: active ? `2px solid ${primary}` : 'none',
			}}
		>
			<SprocketTooltip placement="right" text={value}>
				<IconButton
					sx={{ width: '100%', ':hover': { backgroundColor: 'transparent' } }}
					color="primary"
					onClick={() => setTab(value)}
					size="lg"
				>
					{children}
				</IconButton>
			</SprocketTooltip>
		</Box>
	);
}
