import { useEffect, useState } from 'react';
import { IconButton, Input } from '@mui/joy';
import { ClearRounded, PendingOutlined, SearchRounded } from '@mui/icons-material';
import { useDebounce } from '../../hooks/useDebounce';
import { SprocketTooltip } from './SprocketTooltip';
import { Constants } from '../../constants/constants';

export interface SearchFieldProps {
	onChange: (text: string) => void;
	debounce?: number;
	slideout?: boolean;
}

export function SearchField({ onChange, debounce, slideout = true }: SearchFieldProps) {
	const [isTyping, setTyping] = useState(false);
	const [active, setActive] = useState(false);

	const { localDataState, setLocalDataState, debounceEventEmitter } = useDebounce({
		state: null,
		setState: onChange,
		debounceOverride: debounce ?? Constants.searchDebounceTimeMS,
	});

	useEffect(() => {
		debounceEventEmitter.on('sync', () => {
			setTyping(false);
		});
		debounceEventEmitter.on('desync', () => {
			setTyping(true);
		});
	}, []);

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
					isTyping && localDataState !== '' ? (
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
