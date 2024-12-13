import Checkbox from '@mui/joy/Checkbox';
import { useSelector } from 'react-redux';
import { Option, Select, Stack, Typography } from '@mui/joy';
import { Box } from '@mui/joy';
import { useMemo } from 'react';
import { AccountTree } from '@mui/icons-material';
import { parseEditorJSON, toEditorJSON, EditableData } from '@/components/shared/input/EditableData';
import { EditableText } from '@/components/shared/input/EditableText';
import { EnvironmentContextResolver } from '@/managers/EnvironmentContextResolver';
import { selectSelectedEnvironment, selectEnvironments, selectSecrets } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { toKeyValuePairs } from '@/utils/application';
import { PanelProps } from '../panels.interface';

export function EnvironmentPanel({ id }: PanelProps) {
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const environments = useSelector(selectEnvironments);
	const environment = environments[id];
	const secrets = useSelector(selectSecrets);
	const dispatch = useAppDispatch();

	const envList = useMemo(
		() => Object.values(environments).filter((env) => env.id !== environment?.id),
		[environments],
	);

	if (environment == null) {
		return <Typography>No Environment Found</Typography>;
	}

	function parseEditorText(text: string) {
		const pairs = toKeyValuePairs<string>(parseEditorJSON(text));
		const parsedPairs = EnvironmentContextResolver.buildEnvironmentVariables({
			secrets,
			rootEnv: { ...environment, pairs },
			rootAncestors: Object.values(environments),
		});
		return toEditorJSON(parsedPairs.toArray());
	}

	return (
		<Stack gap={2}>
			<EditableText
				sx={{ margin: 'auto' }}
				text={environment.name}
				setText={(newText: string) => dispatch(activeActions.updateEnvironment({ name: newText, id }))}
				isValidFunc={(text: string) => text.length >= 1}
				level="h2"
			/>
			<Box sx={{ height: '70vh', pb: '5vh' }}>
				<EditableData
					actions={{
						start: (
							<>
								<Checkbox
									sx={{ m: 1 }}
									label="Selected"
									checked={selectedEnvironment === id}
									onChange={() =>
										dispatch(activeActions.selectEnvironment(selectedEnvironment === id ? undefined : id))
									}
								/>
								<Select
									startDecorator={<AccountTree />}
									sx={{ minWidth: '250px' }}
									placeholder="None"
									multiple
									value={environment.parents ?? []}
									onChange={(_, parents) => dispatch(activeActions.updateEnvironment({ parents, id }))}
								>
									{envList.map((env) => (
										<Option key={env.id} value={env.id}>
											{env.name}
										</Option>
									))}
								</Select>
							</>
						),
					}}
					initialValues={environment.pairs}
					onChange={(pairs) => dispatch(activeActions.updateEnvironment({ pairs, id }))}
					fullSize
					envPairs={secrets}
					viewParser={parseEditorText}
				/>
			</Box>
		</Stack>
	);
}
