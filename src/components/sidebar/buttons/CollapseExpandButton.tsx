import { IconButton } from '@mui/joy';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import { SprocketTooltip } from '../../shared/SprocketTooltip';

interface CollapseExpandButtonProps {
	collapsed: boolean;
	setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
	variant?: 'plain' | 'soft';
}

export function CollapseExpandButton({ collapsed, setCollapsed, variant }: CollapseExpandButtonProps) {
	return (
		<SprocketTooltip text={collapsed ? 'Uncollapse' : 'Collapse'}>
			<IconButton
				size="sm"
				variant={variant ?? 'plain'}
				color="primary"
				onClick={() => {
					setCollapsed((isCollapsed) => !isCollapsed);
				}}
			>
				{collapsed ? (
					<KeyboardArrowLeftRoundedIcon fontSize="small" color="primary" />
				) : (
					<KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
				)}
			</IconButton>
		</SprocketTooltip>
	);
}
