import { FunctionComponent } from 'react';
import { PanelProps } from './panels.interface';
import { EndpointPanel } from './endpoint/EndpointPanel';
import { EnvironmentPanel } from './environment/EnvironmentPanel';
import { RequestPanel } from './request/RequestPanel';
import { ScriptPanel } from './script/ScriptPanel';
import { ServicePanel } from './service/ServicePanel';
import { SecretsPanel } from './secrets/SecretsPanel';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../shared/ErrorFallback';
import { WorkspacePanel } from './workspace/WorkspacePanel';
import { ShortItemType } from '@/types/data/item';

const contentMap: Record<string | 'secrets', FunctionComponent<PanelProps>> = {
	[ShortItemType.request]: RequestPanel,
	[ShortItemType.environment]: EnvironmentPanel,
	[ShortItemType.service]: ServicePanel,
	[ShortItemType.endpoint]: EndpointPanel,
	[ShortItemType.script]: ScriptPanel,
	[ShortItemType.workspace]: WorkspacePanel,
	secrets: SecretsPanel,
};

function extractTabContent(id: string) {
	for (const key in contentMap) {
		if (id.startsWith(key)) return contentMap[key];
	}
	throw new Error(`could not determine tab content type from id ${id}`);
}

export function TabContent({ id }: PanelProps) {
	const Tab = extractTabContent(id);
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<Tab id={id} />
		</ErrorBoundary>
	);
}
