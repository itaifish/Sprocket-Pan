import { formatShortFullDate, formatRelativeDate } from '@/utils/string';
import { EditCalendar, SvgIconComponent } from '@mui/icons-material';
import { Chip } from '@mui/joy';
import { SprocketTooltip } from './SprocketTooltip';

interface RelativeTimeChipProps {
	date: number | Date | string;
	Icon?: SvgIconComponent;
	action?: string;
}

export function RelativeTimeChip({ date, Icon = EditCalendar, action = 'Last Modified' }: RelativeTimeChipProps) {
	return (
		<SprocketTooltip text={`${action} on ${formatShortFullDate(date)}`}>
			<Chip variant="soft" sx={{ ml: '-6px' }} startDecorator={<Icon sx={{ mr: '2px' }} />}>
				{formatRelativeDate(date)}
			</Chip>
		</SprocketTooltip>
	);
}
