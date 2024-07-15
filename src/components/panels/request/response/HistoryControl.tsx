import { Typography, Stack, IconButton } from '@mui/joy';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DeleteForever from '@mui/icons-material/DeleteForever';
import { ResponseState } from '../RequestActions';
import { SprocketTooltip } from '../../../shared/SprocketTooltip';
import { EditableText } from '../../../shared/input/EditableText';
import { clamp } from '../../../../utils/math';

interface HistoryControlProps {
	value: ResponseState;
	onChange: (state: ResponseState) => void;
	historyLength: number;
	onDelete?: (index: number) => void;
}

export function HistoryControl({ value, onChange, historyLength, onDelete }: HistoryControlProps) {
	// mathematically in this component, 'error' is treated as historyLength,
	// and 'latest' is identical to historyLength - 1
	const numValue = value === 'latest' ? historyLength - 1 : value === 'error' ? historyLength : value;
	return (
		<Stack direction={'row'}>
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
							sx={{ display: 'flex', alignItems: 'center' }}
							text={`${numValue + 1}`}
							setText={(text: string) => {
								const num = Number.parseInt(text);
								onChange(num - 1);
							}}
							isValidFunc={(text: string) => {
								const num = Number.parseInt(text);
								return !isNaN(num) && num >= 1 && num <= historyLength;
							}}
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
