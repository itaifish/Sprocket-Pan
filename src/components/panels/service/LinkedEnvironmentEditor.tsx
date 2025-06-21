import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import { Select, Stack, Option } from '@mui/joy';
import { Link } from '@mui/icons-material';
import { EllipsisTypography } from '@/components/shared/EllipsisTypography';
import { selectEnvironments } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { Service } from '@/types/data/workspace';

interface LinkedEnvironmentEditorProps {
	service: Service;
}

export function LinkedEnvironmentEditor({ service }: LinkedEnvironmentEditorProps) {
	const environments = useSelector(selectEnvironments);
	const dispatch = useDispatch();
	const envList = useMemo(
		() =>
			Object.values(environments).map((env) => ({ name: env.name, id: env.id, linkedEnv: env.linked?.[service.id] })),
		[environments],
	);
	return (
		<Stack gap={2}>
			{envList.map((env) => (
				<Stack key={env.id} gap={1}>
					<EllipsisTypography>{env.name}</EllipsisTypography>
					<Select
						startDecorator={<Link />}
						placeholder="None"
						value={env.linkedEnv}
						onChange={(_, value) =>
							value == null
								? dispatch(activeActions.removeLinkedEnv({ serviceId: service.id, envId: env.id }))
								: dispatch(activeActions.addLinkedEnv({ serviceEnvId: value, serviceId: service.id, envId: env.id }))
						}
					>
						{Object.values(service.localEnvironments).map((localEnv) => (
							<Option value={localEnv.id} key={localEnv.id}>
								{localEnv.name}
							</Option>
						))}
					</Select>
				</Stack>
			))}
		</Stack>
	);
}
