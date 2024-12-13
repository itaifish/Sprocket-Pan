import { IconButton, IconButtonProps } from '@mui/joy';
import { SprocketTooltip } from '../SprocketTooltip';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

export function FormatButton(props: IconButtonProps) {
	return (
		<SprocketTooltip text={'Format'}>
			<IconButton {...props}>
				<AutoFixHighIcon />
			</IconButton>
		</SprocketTooltip>
	);
}
