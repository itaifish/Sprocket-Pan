import { FunctionComponent } from 'react';
import { PanelProps } from './panels.interface';
import { EndpointPanel } from './endpoint/EndpointPanel';
import { EnvironmentPanel } from './environment/EnvironmentPanel';
import { RequestPanel } from './request/RequestPanel';
import { ScriptPanel } from './script/ScriptPanel';
import { ServicePanel } from './service/ServicePanel';
import { SecretsPanel } from './secrets/SecretsPanel';
import { TabType } from '@/types/state/state';

const contentMap: Record<TabType, FunctionComponent<PanelProps>> = {
	request: RequestPanel,
	environment: EnvironmentPanel,
	service: ServicePanel,
	endpoint: EndpointPanel,
	script: ScriptPanel,
	secrets: SecretsPanel,
};

interface TabContentProps extends PanelProps {
	type: TabType;
}

export function TabContent({ type, id }: TabContentProps) {
	const Tab = contentMap[type];
	return <Tab id={id} />;
}
