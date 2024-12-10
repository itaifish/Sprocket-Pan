import { Typography, Stack, IconButton } from '@mui/joy';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DeleteForever from '@mui/icons-material/DeleteForever';
import { ResponseState } from '../RequestActions';
import { SprocketTooltip } from '../../../shared/SprocketTooltip';
import { EditableText } from '../../../shared/input/EditableText';
import { clamp } from '../../../../utils/math';

export function responseStateToNumber(value?: ResponseState, historyLength?: number) {
	if (value == null || historyLength == null) return 0;
	// mathematically, 'error' is treated as historyLength, and 'latest' is identical to historyLength - 1
	return value === 'latest' ? historyLength - 1 : value === 'error' ? historyLength : value;
}

interface HistoryControlProps {
	value: ResponseState;
	onChange: (state: ResponseState) => void;
	historyLength: number;
	onDelete?: (index: number) => void;
}

export function HistoryControl({ value, onChange, historyLength, onDelete }: HistoryControlProps) {
	const numValue = responseStateToNumber(value, historyLength);
	return (
		<Stack direction="row">
			<SprocketTooltip text={'Previous Response'}>
				<IconButton
					aria-label="Previous Response"
					disabled={value === 0 || historyLength === 0}
					onClick={() => onChange(clamp(numValue - 1, 0, historyLength - 1))}
				>
					<ArrowLeftIcon />
				</IconButton>
			</SprocketTooltip>
			<Typography sx={{ display: 'flex', alignItems: 'center' }}>
				{value === 'error' ? (
					'error'
				) : (
					<>
						<EditableText
							text={`${numValue + 1}`}
							setText={(text: string) => {
								const num = Number.parseInt(text);
								onChange(num - 1);
							}}
							isValidFunc={(text: string) => {
								const num = Number.parseInt(text);
								return !isNaN(num) && num >= 1 && num <= historyLength;
							}}
							narrow
						/>
						/{historyLength}
					</>
				)}
			</Typography>
			<SprocketTooltip text={'Next Response'}>
				<IconButton
					aria-label="Next Response"
					disabled={numValue >= historyLength - 1}
					onClick={() => onChange(clamp(numValue + 1, 0, historyLength - 1))}
				>
					<ArrowRightIcon />
				</IconButton>
			</SprocketTooltip>

			{onDelete && (
				<SprocketTooltip text={'Delete Response'}>
					<IconButton
						disabled={value === 'error' || historyLength === 0}
						aria-label="Delete Response"
						onClick={() => {
							onDelete(numValue);
							if (numValue >= historyLength - 1) {
								onChange('latest');
							}
						}}
					>
						<DeleteForever />
					</IconButton>
				</SprocketTooltip>
			)}
		</Stack>
	);
}
