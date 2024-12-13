import { useState } from 'react';
import { CircularProgress, IconButton } from '@mui/joy';
import SaveIcon from '@mui/icons-material/Save';
import Badge from '@mui/joy/Badge';
import { useSelector } from 'react-redux';
import { selectHasBeenModifiedSinceLastSave } from '@/state/active/selectors';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { saveActiveData } from '@/state/active/thunks/data';
import { useAppDispatch } from '@/state/store';
import { log } from '@/utils/logging';

export function SaveButton() {
	const [loading, setLoading] = useState(false);
	const isModified = useSelector(selectHasBeenModifiedSinceLastSave);
	const dispatch = useAppDispatch();

	async function save() {
		setLoading(true);
		try {
			dispatch(saveActiveData())
				.unwrap()
				.then(() => setTimeout(() => setLoading(false), 500));
		} catch (e) {
			const err = e as Error;
			log.error(`${err.message}\n${err.stack}`);
		}
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
