import { IconButton } from '@mui/joy';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';

export function CollapseExpandButton({
	collapsed,
	setCollapsed,
	variant,
}: {
	collapsed: boolean;
	setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
	variant?: 'plain' | 'soft';
}) {
	return (
		<IconButton
			size="sm"
			variant={variant ?? 'plain'}
			color="primary"
			sx={{ '--IconButton-size': '24px', ml: 'auto' }}
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
	);
}
