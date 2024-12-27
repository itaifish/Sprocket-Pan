import { Button, CircularProgress, FormControl, FormLabel, Input, ListItemDecorator, Stack } from '@mui/joy';
import Code from '@mui/icons-material/Code';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import FunctionsIcon from '@mui/icons-material/Functions';
import ClassIcon from '@mui/icons-material/Class';
import InventoryIcon from '@mui/icons-material/Inventory';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useDebounce } from '@/hooks/useDebounce';
import { Script, VariableFromCode } from '@/types/data/workspace';
import { getVariablesFromCode } from '@/utils/functions';
import { useEffect, useState } from 'react';
import { selectScripts } from '@/state/active/selectors';
import { useSelector } from 'react-redux';
import { log } from '@/utils/logging';
import { SprocketSelect } from '@/components/shared/input/SprocketSelect';

const iconMap: Record<'function' | 'variable' | 'class', JSX.Element> = {
	function: <FunctionsIcon />,
	class: <ClassIcon />,
	variable: <InventoryIcon />,
};

interface ScriptActionsProps {
	script: Script;
	onChange: (script: Partial<Script>) => void;
	isRunning: boolean;
	isDebouncing: boolean;
	isInterrupting: boolean;
	run: () => void;
	interrupt: () => void;
}

export function ScriptActions({
	onChange,
	isRunning,
	run,
	isDebouncing,
	isInterrupting,
	interrupt,
	script,
}: ScriptActionsProps) {
	const [scriptVariables, setScriptVariables] = useState<VariableFromCode[]>([]);
	const scripts = useSelector(selectScripts);

	const scriptCallableNameDebounce = useDebounce({
		state: script.scriptCallableName,
		setState: (newName: string) => onChange({ scriptCallableName: newName }),
	});

	const isValidScriptCallableName = /^[a-zA-Z0-9_]+$/.test(scriptCallableNameDebounce.localDataState);

	useEffect(() => {
		// since we parse this on unvalidated/unfinished user content as well, we're fine if it fails
		// we just fallback to using the last valid variables (which means this needs to remain a useEffect)
		try {
			setScriptVariables(getVariablesFromCode(script.content, Object.values(scripts)));
		} catch (e) {
			log.debug(e);
		}
	}, [script.content]);

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
				<SprocketSelect
					endDecorator={<AssignmentReturnedIcon />}
					startDecorator={script.returnVariable == null ? null : iconMap[script.returnVariable.type]}
					size="md"
					variant="outlined"
					label="Script Return Variable"
					value={script.returnVariable}
					options={[
						{ value: null, label: 'No Return' },
						...scriptVariables.map((variable) => ({
							value: variable,
							label: (
								<>
									<ListItemDecorator>{iconMap[variable.type]}</ListItemDecorator>
									{variable.name}
								</>
							),
							key: variable.name,
						})),
					]}
					onChange={(returnVariable) => onChange({ returnVariable })}
				/>
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
						disabled={isDebouncing}
						startDecorator={<PlayCircleIcon />}
						variant="outlined"
						onClick={run}
					>
						{isDebouncing ? 'Loading' : 'Run'}
					</Button>
				)}
			</FormControl>
		</Stack>
	);
}
