import { IconButton } from '@mui/joy';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';

interface CollapseExpandButtonProps {
	collapsed: boolean;
	toggleCollapsed: () => void;
	variant?: 'plain' | 'soft';
}

export function CollapseExpandButton({ collapsed, toggleCollapsed, variant }: CollapseExpandButtonProps) {
	return (
		<SprocketTooltip text={collapsed ? 'Uncollapse' : 'Collapse'}>
			<IconButton size="sm" variant={variant ?? 'plain'} color="primary" onClick={toggleCollapsed}>
				{collapsed ? (
					<KeyboardArrowLeftRoundedIcon fontSize="small" color="primary" />
				) : (
					<KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
				)}
			</IconButton>
		</SprocketTooltip>
	);
}
