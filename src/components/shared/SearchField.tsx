import { useState } from 'react';
import { IconButton, Input } from '@mui/joy';
import { ClearRounded, PendingOutlined, SearchRounded } from '@mui/icons-material';
import { SprocketTooltip } from './SprocketTooltip';
import { Constants } from '@/constants/constants';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchFieldProps {
	onChange: (text: string) => void;
	debounce?: number;
	slideout?: boolean;
}

export function SearchField({
	onChange,
	debounce = Constants.searchDebounceTimeMS,
	slideout = true,
}: SearchFieldProps) {
	const [isTyping, setTyping] = useState(false);
	const [active, setActive] = useState(false);

	const { localDataState, setLocalDataState } = useDebounce<string | null>({
		state: null,
		setState: (text: string | null) => onChange(text ?? ''),
		debounceMS: debounce,
		onSync: () => setTyping(false),
		onDesync: () => setTyping(true),
	});

	function cancel() {
		setLocalDataState('');
		onChange('');
		setTyping(false);
		setActive(false);
	}

	if (!slideout || active) {
		return (
			<Input
				size="sm"
				variant="outlined"
				placeholder="Search for something"
				endDecorator={
					isTyping ? (
						<PendingOutlined color="secondary" />
					) : (
						<SprocketTooltip text="Clear search">
							<IconButton onClick={cancel}>
								<ClearRounded color="primary" />
							</IconButton>
						</SprocketTooltip>
					)
				}
				sx={{
					boxShadow: 'sm',
					width: '50px',
					flex: 1,
				}}
				value={localDataState || ''}
				onChange={(e) => setLocalDataState(e.target.value)}
			/>
		);
	}

	return (
		<SprocketTooltip text="Search">
			<IconButton onClick={() => setActive(true)} size="sm">
				<SearchRounded color="primary" fontSize="small" />
			</IconButton>
		</SprocketTooltip>
	);
}
