import { useState } from 'react';
import { IconButton, Select, Stack, Option, Box, Divider } from '@mui/joy';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { SectionProps } from './sectionProps';
import { EnvironmentEditor } from './EnvironmentEditor';
import { Link, LinkOff, ModeEdit } from '@mui/icons-material';
import { LinkedEnvironmentEditor } from './LinkedEnvironmentEditor';
import { useSelector } from 'react-redux';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { useComputedRootEnvironment } from '@/hooks/useComputedEnvironment';
import { selectSelectedEnvironment } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { cloneEnv } from '@/utils/application';
import { Environment } from '@/types/data/workspace';

export function EnvironmentsSection({ data, onChange }: SectionProps) {
	const [visibleEnvId, setVisibleEnvId] = useState<string | null>(data.selectedEnvironment ?? null);
	const localEnvs = data.localEnvironments;
	const envList = Object.values(localEnvs);
	const visibleEnv = visibleEnvId == null ? null : data.localEnvironments[visibleEnvId];
	const isVisibleSelected = data.selectedEnvironment === visibleEnvId;
	const dispatch = useAppDispatch();
	const selectedEnv = useSelector(selectSelectedEnvironment);

	const envPairs = useComputedRootEnvironment().toArray();

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

	function deleteEnv(id: string) {
		const newData = structuredClone(localEnvs);
		delete newData[id];
		onChange({
			localEnvironments: newData,
		});
	}

	function toggleLinkedEnvMode() {
		onChange({ linkedEnvMode: !data.linkedEnvMode });
		dispatch(activeActions.selectEnvironment(selectedEnv));
	}

	return (
		<Stack>
			<Box alignSelf="end" height={0}>
				<SprocketTooltip text={`${data.linkedEnvMode ? 'Disable' : 'Enable'} Environment Linking`}>
					<IconButton onClick={toggleLinkedEnvMode}>{data.linkedEnvMode ? <LinkOff /> : <Link />}</IconButton>
				</SprocketTooltip>
			</Box>
			<Box height={data.linkedEnvMode ? 'fit-content' : 0} sx={{ transition: 'all 1s linear', overflow: 'hidden' }}>
				<Box height="20px" />
				<LinkedEnvironmentEditor service={data} />
				<Divider sx={{ margin: '30px' }} />
			</Box>
			<Stack direction="row" gap={1} alignItems="center">
				<Select
					startDecorator={<ModeEdit />}
					placeholder="Choose Environment"
					value={visibleEnvId}
					onChange={(_, value) => setVisibleEnvId(value)}
				>
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
			<Stack width="100%" minWidth="500px" flex={1}>
				{visibleEnv != null && (
					<EnvironmentEditor
						serviceId={data.id}
						env={visibleEnv}
						envPairs={envPairs}
						onChange={(values) =>
							onChange({
								localEnvironments: { ...localEnvs, [visibleEnv.id]: { ...localEnvs[visibleEnv.id], ...values } },
							})
						}
						onDelete={() => deleteEnv(visibleEnv.id)}
						onClone={(env) => addEnv(env, ' (Copy)')}
						selected={isVisibleSelected}
						toggleSelected={
							data.linkedEnvMode
								? null
								: () => onChange({ selectedEnvironment: isVisibleSelected ? undefined : visibleEnv.id })
						}
					/>
				)}
			</Stack>
		</Stack>
	);
}
