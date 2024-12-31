import { Button, CircularProgress, FormControl, FormLabel, Input, Stack } from '@mui/joy';
import Code from '@mui/icons-material/Code';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useDebounce } from '@/hooks/useDebounce';
import { Script } from '@/types/data/workspace';

interface ScriptActionsProps {
	script: Script;
	onChange: (script: Partial<Script>) => void;
	isRunning: boolean;
	isInterrupting: boolean;
	run: () => void;
	interrupt: () => void;
}

export function ScriptActions({ onChange, isRunning, run, isInterrupting, interrupt, script }: ScriptActionsProps) {
	const scriptCallableNameDebounce = useDebounce({
		state: script.scriptCallableName,
		setState: (newName: string) => onChange({ scriptCallableName: newName }),
	});

	const isValidScriptCallableName = /^[a-zA-Z0-9_]+$/.test(scriptCallableNameDebounce.localDataState);

	return (
		<Stack direction="row" spacing={2} justifyContent="space-between" alignItems="end">
			<Stack direction="row" gap={2}>
				<FormControl>
					<FormLabel>Script-Callable Name</FormLabel>
					<Input
						startDecorator={<Code />}
						size="md"
						variant="outlined"
						placeholder="Script-callable name goes here"
						value={scriptCallableNameDebounce.localDataState}
						error={isValidScriptCallableName}
						onChange={(e) => {
							scriptCallableNameDebounce.setLocalDataState(e.target.value);
						}}
						color={isValidScriptCallableName ? 'primary' : 'danger'}
					></Input>
				</FormControl>
			</Stack>
			<FormControl>
				{isRunning ? (
					<Button
						sx={{ width: '200px' }}
						color="warning"
						startDecorator={<CancelIcon />}
						endDecorator={<CircularProgress />}
						disabled={isInterrupting}
						variant="outlined"
						onClick={interrupt}
					>
						{isInterrupting ? 'Cancelling' : 'Cancel'}
					</Button>
				) : (
					<Button
						sx={{ width: '200px' }}
						color="success"
						startDecorator={<PlayCircleIcon />}
						variant="outlined"
						onClick={run}
					>
						Run
					</Button>
				)}
			</FormControl>
		</Stack>
	);
}
