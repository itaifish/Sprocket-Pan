import { FunctionComponent } from 'react';
import { PanelProps } from './panels.interface';
import { TabType } from '../../types/state/state';
import { EndpointPanel } from './endpoint/EndpointPanel';
import { EnvironmentPanel } from './environment/EnvironmentPanel';
import { RequestPanel } from './request/RequestPanel';
import { ScriptPanel } from './script/ScriptPanel';
import { ServicePanel } from './service/ServicePanel';

const contentMap: Record<TabType, FunctionComponent<PanelProps>> = {
	request: RequestPanel,
	environment: EnvironmentPanel,
	service: ServicePanel,
	endpoint: EndpointPanel,
	script: ScriptPanel,
};

export function TabContent({ type, id }: { type: TabType; id: string }) {
	const Tab = contentMap[type];
	return <Tab id={id} />;
}
