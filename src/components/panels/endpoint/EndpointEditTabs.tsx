import { AccordionGroup, Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { useState } from 'react';
import { useAppDispatch } from '../../../state/store';
import { Endpoint } from '../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../utils/string';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';
import { EditableData } from '../../shared/input/EditableData';
import { useComputedServiceEnvironment } from '../../../hooks/useComputedEnvironment';
import { activeActions } from '../../../state/active/slice';

const endpointTabs = ['headers', 'queryParams', 'scripts'] as const;
type EndpointPanelType = (typeof endpointTabs)[number];

export function EndpointEditTabs({ endpoint }: { endpoint: Endpoint }) {
	const [tab, setTab] = useState<EndpointPanelType>('headers');
	const envPairs = useComputedServiceEnvironment(endpoint.serviceId);
	const dispatch = useAppDispatch();
	function update(values: Partial<Endpoint>) {
		dispatch(activeActions.updateEndpoint({ ...values, id: endpoint.id }));
	}
	return (
		<Tabs
			aria-label="tabs"
			size="lg"
			value={tab}
			onChange={(_event, newValue) => {
				const newTabId = newValue as EndpointPanelType;
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
				<EditableData
					initialValues={endpoint.baseHeaders}
					onChange={(baseHeaders) => update({ baseHeaders })}
					envPairs={envPairs}
				/>
			</TabPanel>
			<TabPanel value="queryParams">
				<EditableData
					initialValues={endpoint.baseQueryParams}
					onChange={(baseQueryParams) => update({ baseQueryParams })}
					envPairs={envPairs}
				/>
			</TabPanel>
			<TabPanel value="scripts">
				<AccordionGroup>
					<PrePostScriptDisplay
						onChange={update}
						preRequestScript={endpoint.preRequestScript}
						postRequestScript={endpoint.postRequestScript}
					/>
				</AccordionGroup>
			</TabPanel>
		</Tabs>
	);
}
