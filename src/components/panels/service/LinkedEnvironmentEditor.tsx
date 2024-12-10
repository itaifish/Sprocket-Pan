import { useDispatch, useSelector } from 'react-redux';
import { selectEnvironments } from '../../../state/active/selectors';
import { useMemo } from 'react';
import { Service } from '../../../types/application-data/application-data';
import { Select, Stack, Option } from '@mui/joy';
import { Link } from '@mui/icons-material';
import { EllipsisTypography } from '../../shared/EllipsisTypography';
import { activeActions } from '../../../state/active/slice';

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
							dispatch(activeActions.addLinkedEnv({ serviceEnvId: value, serviceId: service.id, envId: env.id }))
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
