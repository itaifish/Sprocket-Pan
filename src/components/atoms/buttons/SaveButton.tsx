import { useState } from 'react';
import { CircularProgress, IconButton } from '@mui/joy';
import SaveIcon from '@mui/icons-material/Save';
import Badge from '@mui/joy/Badge';
import { SprocketTooltip } from '../SprocketTooltip';
import { useAppDispatch } from '../../../state/store';
import { selectHasBeenModifiedSinceLastSave } from '../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { saveActiveData } from '../../../state/active/thunks/environments';

export function SaveButton() {
	const [loading, setLoading] = useState(false);
	const isModified = useSelector(selectHasBeenModifiedSinceLastSave);
	const dispatch = useAppDispatch();

	async function save() {
		setLoading(true);
		await dispatch(saveActiveData()).unwrap();
		setTimeout(() => setLoading(false), 500);
	}

	return (
		<SprocketTooltip text="Save">
			<Badge
				size="sm"
				invisible={!isModified}
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
					onClick={save}
					disabled={!isModified || loading}
				>
					{loading ? <CircularProgress /> : <SaveIcon />}
				</IconButton>
			</Badge>
		</SprocketTooltip>
	);
}
