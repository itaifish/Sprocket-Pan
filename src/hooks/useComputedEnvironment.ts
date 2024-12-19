import { EnvironmentContextResolver } from '@/managers/EnvironmentContextResolver';
import {
	selectSecrets,
	selectSelectedEnvironmentValue,
	selectEnvironments,
	selectRequestsById,
	selectEndpointById,
	selectServicesById,
	selectSelectedServiceEnvironments,
} from '@/state/active/selectors';
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

export function useComputedServiceEnvironment(id: string) {
	const args = useRootEnvironmentArgs();
	const service = useSelector((state) => selectServicesById(state, id));
	const selectedEnvId = useSelector(selectSelectedServiceEnvironments)[service.id];
	return EnvironmentContextResolver.buildEnvironmentVariables({
		...args,
		servEnv: selectedEnvId == null ? null : service.localEnvironments[selectedEnvId],
	});
}

export function useComputedRequestEnvironment(id: string) {
	const args = useRootEnvironmentArgs();
	const request = useSelector((state) => selectRequestsById(state, id));
	const endpoint = useSelector((state) => selectEndpointById(state, request.endpointId));
	const service = useSelector((state) => selectServicesById(state, endpoint.serviceId));
	const selectedEnvId = useSelector(selectSelectedServiceEnvironments)[service.id];
	return EnvironmentContextResolver.buildEnvironmentVariables({
		...args,
		reqEnv: request.environmentOverride,
		servEnv: selectedEnvId == null ? null : service.localEnvironments[selectedEnvId],
	});
}
