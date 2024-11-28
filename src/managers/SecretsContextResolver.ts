import { Environment, Secrets } from '../types/application-data/application-data';

export class SecretsContextResolver {
	public static injectSecrets(secrets: Secrets, environment: Environment) {
		//basically make a new environment with secrets
		return environment;
	}
}
