import { Divider, useTheme } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { PanelResizeHandle } from 'react-resizable-panels';

interface SprocketResizeHandleProps {
	horizontal?: boolean;
	sx?: SxProps;
}

export function SprocketResizeHandle({ horizontal = false, sx }: SprocketResizeHandleProps) {
	const theme = useTheme();
	return (
		<PanelResizeHandle>
			<Divider
				sx={{
					boxSizing: 'border-box',
					m: horizontal ? 1 : 0,
					width: horizontal ? '100%' : '2px',
					height: horizontal ? '2px' : '100%',
					backgroundColor: theme.palette.background.level2,
					':hover': { border: '1px solid ' + theme.palette.primary.outlinedBorder },
					...sx,
				}}
				orientation={horizontal ? 'horizontal' : 'vertical'}
			/>
		</PanelResizeHandle>
	);
}
