import { Divider, useTheme } from '@mui/joy';
import { PanelResizeHandle } from 'react-resizable-panels';

export function SprocketResizeHandle() {
	const theme = useTheme();
	return (
		<PanelResizeHandle>
			<Divider
				sx={{
					boxSizing: 'border-box',
					m: 1,
					height: '4px',
					':hover': { border: '2px solid ' + theme.palette.primary[700] },
				}}
			/>
		</PanelResizeHandle>
	);
}
