import { useSelector } from 'react-redux';
import {
	selectEndpointById,
	selectEnvironments,
	selectRequestsById,
	selectSecrets,
	selectSelectedEnvironmentValue,
	selectServiceSelectedEnvironmentValue,
} from '../state/active/selectors';
import { EnvironmentContextResolver } from '../managers/EnvironmentContextResolver';

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
	const servEnv = useSelector((state) => selectServiceSelectedEnvironmentValue(state, id));
	return EnvironmentContextResolver.buildEnvironmentVariables({
		...args,
		servEnv,
	});
}

export function useComputedRequestEnvironment(id: string) {
	const args = useRootEnvironmentArgs();
	const request = useSelector((state) => selectRequestsById(state, id));
	const endpoint = useSelector((state) => selectEndpointById(state, request.endpointId));
	const servEnv = useSelector((state) => selectServiceSelectedEnvironmentValue(state, endpoint.serviceId));
	return EnvironmentContextResolver.buildEnvironmentVariables({
		...args,
		reqEnv: request.environmentOverride,
		servEnv,
	});
}
