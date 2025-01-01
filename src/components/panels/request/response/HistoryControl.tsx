import { Typography, Stack, IconButton } from '@mui/joy';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DeleteForever from '@mui/icons-material/DeleteForever';
import { EditableText } from '@/components/shared/input/EditableText';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { clamp } from '@/utils/math';

interface HistoryControlProps {
	value: number;
	onChange: (state: number) => void;
	historyLength: number;
	onDelete?: (index: number) => void;
}

export function HistoryControl({ value, onChange, historyLength, onDelete }: HistoryControlProps) {
	return (
		<Stack direction="row">
			<SprocketTooltip text="Previous Response">
				<IconButton
					aria-label="Previous Response"
					disabled={value === 0 || historyLength === 0}
					onClick={() => onChange(clamp(value - 1, 0, historyLength - 1))}
				>
					<ArrowLeftIcon />
				</IconButton>
			</SprocketTooltip>
			<Typography sx={{ display: 'flex', alignItems: 'center' }} component="div">
				<>
					<EditableText
						text={`${value + 1}`}
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
			</Typography>
			<SprocketTooltip text="Next Response">
				<IconButton
					aria-label="Next Response"
					disabled={value >= historyLength - 1}
					onClick={() => onChange(clamp(value + 1, 0, historyLength - 1))}
				>
					<ArrowRightIcon />
				</IconButton>
			</SprocketTooltip>
			{onDelete && (
				<SprocketTooltip text="Delete Response">
					<IconButton
						disabled={historyLength === 0}
						aria-label="Delete Response"
						onClick={() => {
							onDelete(value);
							if (value >= historyLength - 1) {
								onChange(historyLength - 2);
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
