import { Divider, useTheme } from '@mui/joy';
import { PanelResizeHandle } from 'react-resizable-panels';

export function SprocketResizeHandle() {
	const theme = useTheme();
	return (
		<PanelResizeHandle>
			<Divider sx={{ m: 1, height: '5px', ':hover': { outline: '2px solid ' + theme.palette.primary[500] } }} />
		</PanelResizeHandle>
	);
}
