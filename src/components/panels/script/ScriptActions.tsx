import {
	Button,
	Chip,
	CircularProgress,
	FormControl,
	FormLabel,
	Input,
	ListItemDecorator,
	Option,
	Select,
	Stack,
} from '@mui/joy';
import Code from '@mui/icons-material/Code';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import FunctionsIcon from '@mui/icons-material/Functions';
import ClassIcon from '@mui/icons-material/Class';
import InventoryIcon from '@mui/icons-material/Inventory';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { useDebounce } from '@/hooks/useDebounce';
import { Script } from '@/types/data/workspace';
import { getVariablesFromCode } from '@/utils/functions';
import { useMemo } from 'react';
import { selectScripts } from '@/state/active/selectors';
import { useSelector } from 'react-redux';

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
	run: () => void;
	interrupt: () => void;
}

export function ScriptActions({ onChange, isRunning, run, isDebouncing, interrupt, script }: ScriptActionsProps) {
	const scripts = useSelector(selectScripts);

	const scriptCallableNameDebounce = useDebounce({
		state: script.scriptCallableName,
		setState: (newName: string) => onChange({ scriptCallableName: newName }),
	});

	const isValidScriptCallableName = /^[a-zA-Z0-9_]+$/.test(scriptCallableNameDebounce.localDataState);

	const scriptVariables = useMemo(
		() =>
			new Map(
				getVariablesFromCode(script.content, Object.values(scripts)).map(
					(variableFromCode) => [variableFromCode.name, variableFromCode] as const,
				),
			),
		[script.content],
	);

	return (
		<Stack direction="row" spacing={2}>
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
			<FormControl>
				<FormLabel>Script Return Variable</FormLabel>
				<Select
					endDecorator={<AssignmentReturnedIcon />}
					size="md"
					variant="outlined"
					onChange={(_event: React.SyntheticEvent | null, newValue: string | null) => {
						const variable = scriptVariables.get(newValue as string);
						if (variable) {
							onChange({
								returnVariableName: newValue,
								returnVariableType: {
									isClass: variable.type === 'class',
									typeText: variable.typescriptTypeString,
								},
							});
						} else {
							onChange({ returnVariableName: newValue, returnVariableType: undefined });
						}
					}}
					value={script.returnVariableName}
					renderValue={(option) => {
						const variable = scriptVariables.get(option?.value as string);
						if (variable == null) {
							return option?.label;
						}
						return (
							<>
								<ListItemDecorator>{iconMap[variable.type]} </ListItemDecorator>
								{variable.name}
							</>
						);
					}}
				>
					<Option value={null}>No return</Option>
					{[...scriptVariables.values()].map((variable, index) => (
						<Option key={index} value={variable.name}>
							<ListItemDecorator>{iconMap[variable.type]} </ListItemDecorator>
							{variable.name}
						</Option>
					))}
				</Select>
			</FormControl>
			<FormControl>
				<FormLabel>Loading Status</FormLabel>
				<Chip
					endDecorator={isDebouncing ? <HourglassTopIcon /> : <ThumbUpOffAltIcon color="primary" />}
					variant="outlined"
					color={isDebouncing ? 'neutral' : 'primary'}
					size="lg"
				>
					{isDebouncing ? 'Loading' : 'Ready'}
				</Chip>
			</FormControl>
			<FormControl>
				<FormLabel>Action</FormLabel>
				{!isRunning && (
					<Button
						color="success"
						disabled={isDebouncing}
						startDecorator={<PlayCircleIcon />}
						variant="outlined"
						onClick={run}
					>
						Run
					</Button>
				)}
				{isRunning && (
					<Button
						color="warning"
						startDecorator={<CancelIcon />}
						endDecorator={<CircularProgress />}
						variant="outlined"
						onClick={interrupt}
					>
						Cancel
					</Button>
				)}
			</FormControl>
		</Stack>
	);
}
