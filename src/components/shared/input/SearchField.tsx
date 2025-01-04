import { useState } from 'react';
import { IconButton, Input } from '@mui/joy';
import { ClearRounded, PendingOutlined, Search } from '@mui/icons-material';
import { Constants } from '@/constants/constants';
import { useDebounce } from '@/hooks/useDebounce';
import { SprocketTooltip } from '../SprocketTooltip';
import { SxProps } from '@mui/joy/styles/types';

export interface SearchFieldProps {
	onChange: (text: string) => void;
	debounce?: number;
	slideout?: boolean;
	sx?: SxProps;
}

export function SearchField({ onChange, debounce = Constants.searchDebounceTimeMS, sx }: SearchFieldProps) {
	const [isTyping, setTyping] = useState(false);

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
	}

	return (
		<Input
			fullWidth
			size="sm"
			variant="outlined"
			placeholder="Search"
			sx={{ minWidth: '150px', flex: 1, ...sx }}
			startDecorator={<Search />}
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
			value={localDataState || ''}
			onChange={(e) => setLocalDataState(e.target.value)}
		/>
	);
}
