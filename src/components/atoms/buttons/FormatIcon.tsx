import { IconButton } from '@mui/joy';
import { SprocketTooltip } from '../SprocketTooltip';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

export function FormatIcon({ actionFunction }: { actionFunction: () => void }) {
	return (
		<SprocketTooltip text={'Format'}>
			<IconButton onClick={() => actionFunction()}>
				<AutoFixHighIcon />
			</IconButton>
		</SprocketTooltip>
	);
}
