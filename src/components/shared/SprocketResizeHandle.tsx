import { Divider, useTheme } from '@mui/joy';
import { PanelResizeHandle } from 'react-resizable-panels';

interface SprocketResizeHandleProps {
	horizontal?: boolean;
}

export function SprocketResizeHandle({ horizontal = false }: SprocketResizeHandleProps) {
	const theme = useTheme();
	return (
		<PanelResizeHandle>
			<Divider
				sx={{
					boxSizing: 'border-box',
					m: horizontal ? 1 : 0,
					width: horizontal ? '100%' : '4px',
					height: horizontal ? '4px' : '100%',
					backgroundColor: theme.palette.background.level2,
					':hover': { border: '2px solid ' + theme.palette.primary.outlinedBorder },
				}}
				orientation={horizontal ? 'horizontal' : 'vertical'}
			/>
		</PanelResizeHandle>
	);
}
