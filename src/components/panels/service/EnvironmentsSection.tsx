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
import { selectSelectedEnvironment, selectSelectedServiceEnvironments } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { cloneEnv } from '@/utils/application';
import { Environment } from '@/types/data/workspace';

export function EnvironmentsSection({ service, onChange }: SectionProps) {
	const selectedEnvironment = useSelector(selectSelectedServiceEnvironments)[service.id];
	const [visibleEnvId, setVisibleEnvId] = useState<string | null>(selectedEnvironment ?? null);
	const localEnvs = service.localEnvironments;
	const envList = Object.values(localEnvs);
	const visibleEnv = visibleEnvId == null ? null : service.localEnvironments[visibleEnvId];
	const dispatch = useAppDispatch();
	const selectedEnv = useSelector(selectSelectedEnvironment);

	const envPairs = useComputedRootEnvironment().toArray();

	function addEnv(
		env: Partial<Environment> = { name: `${service.name}.env.${Object.keys(service.localEnvironments).length}` },
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
		onChange({ linkedEnvMode: !service.linkedEnvMode });
		dispatch(activeActions.selectEnvironment(selectedEnv));
	}

	function toggleSelectedEnv() {
		if (visibleEnvId == null || service.linkedEnvMode) return;
		const serviceEnvId = selectedEnvironment === visibleEnvId ? undefined : visibleEnvId;
		dispatch(activeActions.setSelectedServiceEnvironment({ serviceId: service.id, serviceEnvId }));
	}

	return (
		<Stack>
			<Box alignSelf="end" height={0}>
				<SprocketTooltip text={`${service.linkedEnvMode ? 'Disable' : 'Enable'} Environment Linking`}>
					<IconButton onClick={toggleLinkedEnvMode}>{service.linkedEnvMode ? <LinkOff /> : <Link />}</IconButton>
				</SprocketTooltip>
			</Box>
			<Box height={service.linkedEnvMode ? 'fit-content' : 0} sx={{ transition: 'all 1s linear', overflow: 'hidden' }}>
				<Box height="20px" />
				<LinkedEnvironmentEditor service={service} />
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
						serviceId={service.id}
						env={visibleEnv}
						envPairs={envPairs}
						onChange={(values) =>
							onChange({
								localEnvironments: { ...localEnvs, [visibleEnv.id]: { ...localEnvs[visibleEnv.id], ...values } },
							})
						}
						onDelete={() => deleteEnv(visibleEnv.id)}
						onClone={(env) => addEnv(env, ' (Copy)')}
						selected={selectedEnvironment === visibleEnvId}
						toggleSelected={service.linkedEnvMode ? null : toggleSelectedEnv}
					/>
				)}
			</Stack>
		</Stack>
	);
}
