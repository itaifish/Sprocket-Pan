import { useSelector } from 'react-redux';
import { IconButton, Option, Select, Stack, Typography } from '@mui/joy';
import { Box } from '@mui/joy';
import { useMemo } from 'react';
import { AccountTree, RadioButtonChecked, RadioButtonUnchecked } from '@mui/icons-material';
import { parseEditorJSON, toEditorJSON, EditableData } from '@/components/shared/input/EditableData';
import { EnvironmentContextResolver } from '@/managers/EnvironmentContextResolver';
import { selectSelectedEnvironment, selectEnvironments, selectSecrets } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { toKeyValuePairs } from '@/utils/application';
import { PanelProps } from '../panels.interface';
import { EditableHeader } from '../shared/EditableHeader';
import { SyncButton } from '@/components/shared/buttons/SyncButton';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';

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
			<EditableHeader
				left={
					<SprocketTooltip text={selectedEnvironment === id ? 'Unselect' : 'Select'}>
						<IconButton
							onClick={() => dispatch(activeActions.selectEnvironment(selectedEnvironment === id ? undefined : id))}
						>
							{selectedEnvironment === id ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
						</IconButton>
					</SprocketTooltip>
				}
				value={environment.name}
				onChange={(name) => dispatch(activeActions.updateEnvironment({ name, id }))}
				right={<SyncButton id={id} />}
			/>
			<Box sx={{ height: '70vh', pb: '5vh' }}>
				<EditableData
					actions={{
						start: (
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
