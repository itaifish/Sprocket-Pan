import { useState } from 'react';
import { CircularProgress, IconButton } from '@mui/joy';
import SaveIcon from '@mui/icons-material/Save';
import Badge from '@mui/joy/Badge';
import { useSelector } from 'react-redux';
import { selectHasBeenModifiedSinceLastSave } from '@/state/active/selectors';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { saveActiveData } from '@/state/active/thunks/data';
import { useAppDispatch } from '@/state/store';

export function SaveButton() {
	const [loading, setLoading] = useState(false);
	const isModified = useSelector(selectHasBeenModifiedSinceLastSave);
	const dispatch = useAppDispatch();

	async function save() {
		setLoading(true);

		dispatch(saveActiveData())
			.unwrap()
			.then(() => setTimeout(() => setLoading(false), 500));
	}

	return (
		<SprocketTooltip text="Save" placement="right">
			<Badge
				size="sm"
				invisible={!isModified}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				badgeInset="14%"
			>
				<IconButton variant="soft" color="neutral" onClick={save} disabled={!isModified || loading}>
					{loading ? <CircularProgress /> : <SaveIcon />}
				</IconButton>
			</Badge>
		</SprocketTooltip>
	);
}
