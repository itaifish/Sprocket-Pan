import { useState } from 'react';
import { CircularProgress, IconButton } from '@mui/joy';
import SaveIcon from '@mui/icons-material/Save';
import Badge from '@mui/joy/Badge';
import { SprocketTooltip } from '../SprocketTooltip';
import { useAppDispatch } from '../../../state/store';
import { saveActiveData } from '../../../state/active/thunks';

export function SaveButton() {
	const [loading, setLoading] = useState(false);
	// todo: restore isModified behavior with dedicated selector
	const dispatch = useAppDispatch();
	return (
		<>
			{loading ? (
				<CircularProgress />
			) : (
				<SprocketTooltip text="Save">
					<Badge
						size="sm"
						invisible={false}
						anchorOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						badgeInset="14%"
					>
						<IconButton
							id="toggle-mode"
							size="sm"
							variant="soft"
							color="neutral"
							onClick={async () => {
								setLoading(true);
								dispatch(saveActiveData());
								setTimeout(() => setLoading(false), 200);
							}}
							disabled={false}
						>
							<SaveIcon />
						</IconButton>
					</Badge>
				</SprocketTooltip>
			)}
		</>
	);
}
