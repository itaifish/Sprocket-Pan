import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { EndpointRequest, Environment } from '../../../../types/application-data/application-data';
import { useState } from 'react';
import { RequestBody } from './RequestBody';
import { camelCaseToTitle } from '../../../../utils/string';
import { EnvironmentEditableTable } from '../../editing/EnvironmentEditableTable';
import { applicationDataManager } from '../../../../managers/ApplicationDataManager';

const requestTabs = ['body', 'headers', 'queryParams', 'environment'] as const;
type RequestTabType = (typeof requestTabs)[number];

export function RequestEditTabs({ request }: { request: EndpointRequest }) {
	const [tab, setTab] = useState<RequestTabType>('body');
	return (
		<Tabs
			aria-label="tabs"
			size="lg"
			value={tab}
			onChange={(_event, newValue) => {
				const newTabId = newValue as RequestTabType;
				setTab(newTabId);
			}}
		>
			<TabList color="primary">
				{requestTabs.map((curTab, index) => (
					<Tab color={curTab === tab ? 'primary' : 'neutral'} value={curTab} key={index}>
						{camelCaseToTitle(curTab)}
					</Tab>
				))}
			</TabList>
			<TabPanel value={'body'}>
				<RequestBody requestData={request}></RequestBody>
			</TabPanel>
			<TabPanel value="headers">
				<EnvironmentEditableTable
					environment={request.headers as Environment}
					setNewEnvironment={(newEnvironment: Environment) =>
						applicationDataManager.update('request', request.id, { headers: newEnvironment })
					}
				/>
			</TabPanel>
		</Tabs>
	);
}
