import { useState } from 'react';
import { Box, IconButton, Stack } from '@mui/joy';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

import { useSelector } from 'react-redux';
import { EnvironmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import { selectSecrets, selectSelectedEnvironmentValue } from '../../../state/active/selectors';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { EditableText } from '../../shared/input/EditableText';
import { AreYouSureModal } from '../../shared/modals/AreYouSureModal';
import { EditableData } from '../../shared/input/EditableData';
import { SectionProps } from './sectionProps';
import { Environment } from '../../../types/application-data/application-data';
import { cloneEnv } from '../../../utils/application';

export function EnvironmentsSection({ data, onChange }: SectionProps) {
	const secrets = useSelector(selectSecrets);
	const rootEnv = useSelector(selectSelectedEnvironmentValue);
	const [envToDelete, setEnvToDelete] = useState<string | null>(null);
	const localEnvs = data.localEnvironments;

	const envPairs = EnvironmentContextResolver.buildEnvironmentVariables({ rootEnv, secrets }).toArray();

	function modifyEnv(id: string, content: Partial<Environment>) {
		onChange({ localEnvironments: { ...localEnvs, [id]: { ...localEnvs[id], ...content } } });
	}

	function addEnv(
		env: Partial<Environment> = { name: `${data.name}.env.${Object.keys(data.localEnvironments).length}` },
		nameMod?: string,
	) {
		const newEnv = cloneEnv(env, nameMod);
		onChange({
			localEnvironments: {
				...localEnvs,
				[newEnv.id]: newEnv,
			},
		});
	}

	function deleteEnv() {
		if (envToDelete) {
			const newData = structuredClone(localEnvs);
			delete newData[envToDelete];
			onChange({
				localEnvironments: newData,
			});
		}
	}

	return (
		<Box>
			<SprocketTooltip text="Add New Service Environment">
				<IconButton onClick={() => addEnv()}>
					<PlaylistAddIcon />
				</IconButton>
			</SprocketTooltip>
			<Stack spacing={4}>
				{Object.values(data.localEnvironments).map((env) => (
					<Box key={env.id}>
						<EditableText
							text={env.name}
							setText={(name) => modifyEnv(env.id, { name })}
							isValidFunc={function (text: string): boolean {
								return text != '';
							}}
							isTitle
							color={data.selectedEnvironment === env.id ? 'primary' : 'neutral'}
						></EditableText>
						<SprocketTooltip text={data.selectedEnvironment === env.id ? 'Unselect' : 'Select'}>
							<IconButton
								onClick={() => {
									onChange({
										selectedEnvironment: data.selectedEnvironment === env.id ? undefined : env.id,
									});
								}}
							>
								{data.selectedEnvironment === env.id ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
							</IconButton>
						</SprocketTooltip>
						<SprocketTooltip text="Duplicate" onClick={() => addEnv(env, ' (Copy)')}>
							<IconButton>
								<FileCopyIcon />
							</IconButton>
						</SprocketTooltip>
						<SprocketTooltip
							text="Delete"
							onClick={() => {
								setEnvToDelete(env.id);
							}}
						>
							<IconButton>
								<DeleteIcon />
							</IconButton>
						</SprocketTooltip>

						<EditableData values={env.pairs} onChange={(pairs) => modifyEnv(env.id, { pairs })} envPairs={envPairs} />
					</Box>
				))}
			</Stack>
			<AreYouSureModal
				open={!!envToDelete}
				closeFunc={() => setEnvToDelete(null)}
				action={`delete ${data.localEnvironments[envToDelete ?? '']?.name ?? envToDelete}`}
				actionFunc={deleteEnv}
			></AreYouSureModal>
		</Box>
	);
}
