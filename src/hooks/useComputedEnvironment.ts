import { EnvironmentContextResolver } from '@/managers/EnvironmentContextResolver';
import {
	selectSecrets,
	selectSelectedEnvironmentValue,
	selectEnvironments,
	selectSelectedServiceEnvironments,
} from '@/state/active/selectors';
import { itemActions } from '@/state/items';
import { useSelector } from 'react-redux';

function useRootEnvironmentArgs() {
	const secrets = useSelector(selectSecrets);
	const rootEnv = useSelector(selectSelectedEnvironmentValue);
	const environments = useSelector(selectEnvironments);
	return { secrets, rootEnv, rootAncestors: Object.values(environments) };
}

export function useComputedRootEnvironment() {
	const args = useRootEnvironmentArgs();
	return EnvironmentContextResolver.buildEnvironmentVariables(args);
}

export function useComputedServiceEnvironment(id?: string) {
	const args = useRootEnvironmentArgs();
	const service = useSelector((state) => itemActions.service.select(state, id));
	const selectedEnvId = service == null ? null : useSelector(selectSelectedServiceEnvironments)[service.id];
	return EnvironmentContextResolver.buildEnvironmentVariables({
		...args,
		servEnv: selectedEnvId == null ? null : service?.localEnvironments[selectedEnvId],
	});
}

export function useComputedRequestEnvironment(id?: string) {
	const args = useRootEnvironmentArgs();
	const request = useSelector((state) => itemActions.request.select(state, id));
	const endpoint = useSelector((state) => itemActions.endpoint.select(state, request?.endpointId));
	const service = useSelector((state) => itemActions.service.select(state, endpoint?.serviceId));
	const selectedEnvId = service == null ? null : useSelector(selectSelectedServiceEnvironments)[service.id];
	return EnvironmentContextResolver.buildEnvironmentVariables({
		...args,
		reqEnv: request?.environmentOverride,
		servEnv: selectedEnvId == null ? null : service?.localEnvironments[selectedEnvId],
	});
}
