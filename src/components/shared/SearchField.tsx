import { useEffect, useState } from 'react';
import { IconButton, IconButtonProps, Input } from '@mui/joy';
import { ClearRounded, PendingOutlined, SearchRounded } from '@mui/icons-material';
import { useDebounce } from '../../hooks/useDebounce';
import { Constants } from '../../utils/constants';
import { SprocketTooltip } from './SprocketTooltip';

export interface SearchFieldProps {
	onChange: (text: string) => void;
	debounce?: number;
	slideout?: boolean;
}

function SearchHoverClear(props: IconButtonProps) {
	return (
		<SprocketTooltip text="clear search">
			<IconButton {...props}>
				<ClearRounded color="primary" />
			</IconButton>
		</SprocketTooltip>
	);
}

export function SearchField({ onChange, debounce, slideout = true }: SearchFieldProps) {
	const [isTyping, setTyping] = useState(false);
	const [active, setActive] = useState(false);

	const { localDataState, setLocalDataState, debounceEventEmitter } = useDebounce({
		state: '',
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
						<SearchHoverClear onClick={cancel} />
					)
				}
				sx={{
					boxShadow: 'sm',
					width: '50px',
					flex: 1,
				}}
				value={localDataState}
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
