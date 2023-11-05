import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { Endpoint, Environment } from '../../../../types/application-data/application-data';
import { useState } from 'react';
import { camelCaseToTitle } from '../../../../utils/string';
import { EnvironmentEditableTable } from '../../editing/EnvironmentEditableTable';
import { applicationDataManager } from '../../../../managers/ApplicationDataManager';
import { QueryParamEditableTable } from '../../editing/QueryParamEditableTable';
import { EndpointScripts } from './EndpointScripts';

const endpointTabs = ['headers', 'queryParams', 'scripts'] as const;
type EndpointTabType = (typeof endpointTabs)[number];

export function EndpointEditTabs({ endpoint }: { endpoint: Endpoint }) {
	const [tab, setTab] = useState<EndpointTabType>('headers');
	return (
		<Tabs
			aria-label="tabs"
			size="lg"
			value={tab}
			onChange={(_event, newValue) => {
				const newTabId = newValue as EndpointTabType;
				setTab(newTabId);
			}}
		>
			<TabList color="primary">
				{endpointTabs.map((curTab, index) => (
					<Tab color={curTab === tab ? 'primary' : 'neutral'} value={curTab} key={index}>
						{camelCaseToTitle(curTab)}
					</Tab>
				))}
			</TabList>

			<TabPanel value="headers">
				<EnvironmentEditableTable
					environment={endpoint.baseHeaders as Environment}
					setNewEnvironment={(newEnvironment: Environment) =>
						applicationDataManager.update('endpoint', endpoint.id, { baseHeaders: newEnvironment })
					}
				/>
			</TabPanel>
			<TabPanel value="queryParams">
				<QueryParamEditableTable
					queryParams={endpoint.baseQueryParams}
					setNewQueryParams={(newQueryParams: Record<string, string[]>) => {
						applicationDataManager.update('endpoint', endpoint.id, { baseQueryParams: newQueryParams });
					}}
				/>
			</TabPanel>
			<TabPanel value="scripts">
				<EndpointScripts endpoint={endpoint} />
			</TabPanel>
		</Tabs>
	);
}
