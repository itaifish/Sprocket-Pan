import { FunctionComponent } from 'react';
import { TabType } from '../../../types/state/state';
import { RequestTab } from './RequestTab';
import { EndpointTab } from './EndpointTab';
import { ServiceTab } from './ServiceTab';
import { EnvironmentTab } from './EnvironmentTab';

const contentMap: Record<TabType, FunctionComponent<TabProps>> = {
	request: RequestTab,
	environment: EnvironmentTab,
	service: ServiceTab,
	endpoint: EndpointTab,
};

export function TabContent({ type, id }: { type: TabType; id: string }) {
	const Tab = contentMap[type];
	return <Tab id={id} />;
}

export interface TabProps {
	id: string;
}
