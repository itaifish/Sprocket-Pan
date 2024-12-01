import { useState } from 'react';
import { Box, IconButton, Select, Stack, Option } from '@mui/joy';
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
import { Link } from '@mui/icons-material';

export function EnvironmentsSection({ data, onChange }: SectionProps) {
	const secrets = useSelector(selectSecrets);
	const rootEnv = useSelector(selectSelectedEnvironmentValue);
	const [envToDelete, setEnvToDelete] = useState<string | null>(null);
	const [visibleEnvId, setVisibleEnvId] = useState<string | null>(data.selectedEnvironment ?? null);
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
		setVisibleEnvId(newEnv.id);
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

	const envList = Object.values(data.localEnvironments);
	const visibleEnv = visibleEnvId == null ? null : data.localEnvironments[visibleEnvId];

	return (
		<Box>
			<Stack direction="row" gap={1}>
				<Select placeholder="Choose Environment" value={visibleEnvId} onChange={(_, value) => setVisibleEnvId(value)}>
					{envList.map((env) => (
						<Option value={env.id} key={env.id}>
							{env.name}
						</Option>
					))}
				</Select>
				<SprocketTooltip text="Add New Service-Scoped Environment">
					<IconButton onClick={() => addEnv()}>
						<PlaylistAddIcon />
					</IconButton>
				</SprocketTooltip>
			</Stack>
			{visibleEnv != null && (
				<EditableData
					actions={{
						middle: (
							<EditableText
								text={visibleEnv.name}
								setText={(name) => modifyEnv(visibleEnv.id, { name })}
								isValidFunc={function (text: string): boolean {
									return text != '';
								}}
								color={data.selectedEnvironment === visibleEnv.id ? 'primary' : 'neutral'}
							/>
						),
						start: (
							<>
								<SprocketTooltip text={data.selectedEnvironment === visibleEnv.id ? 'Unselect' : 'Select'}>
									<IconButton
										onClick={() => {
											onChange({
												selectedEnvironment: data.selectedEnvironment === visibleEnv.id ? undefined : visibleEnv.id,
											});
										}}
									>
										{data.selectedEnvironment === visibleEnv.id ? (
											<RadioButtonCheckedIcon />
										) : (
											<RadioButtonUncheckedIcon />
										)}
									</IconButton>
								</SprocketTooltip>
								<SprocketTooltip text="Duplicate">
									<IconButton onClick={() => addEnv(visibleEnv, ' (Copy)')}>
										<FileCopyIcon />
									</IconButton>
								</SprocketTooltip>
								<SprocketTooltip text="Delete">
									<IconButton onClick={() => setEnvToDelete(visibleEnv.id)}>
										<DeleteIcon />
									</IconButton>
								</SprocketTooltip>
								<SprocketTooltip text="Link with Global Environment">
									<IconButton>
										<Link />
									</IconButton>
								</SprocketTooltip>
							</>
						),
					}}
					values={visibleEnv.pairs}
					onChange={(pairs) => modifyEnv(visibleEnv.id, { pairs })}
					envPairs={envPairs}
				/>
			)}
			<AreYouSureModal
				open={!!envToDelete}
				closeFunc={() => setEnvToDelete(null)}
				action={`delete ${data.localEnvironments[envToDelete ?? '']?.name ?? envToDelete}`}
				actionFunc={deleteEnv}
			></AreYouSureModal>
		</Box>
	);
}
