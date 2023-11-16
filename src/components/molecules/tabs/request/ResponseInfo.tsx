import { Tab, TabList, TabPanel, Tabs, Typography } from '@mui/joy';
import { HistoricalEndpointResponse } from '../../../../types/application-data/application-data';
import { ResponseBody } from './ResponseBody';
import { camelCaseToTitle, formatDate, statusCodes } from '../../../../utils/string';
import { useState } from 'react';
import { ValuesOf } from '../../../../types/utils/utils';

const responseTabs = ['responseBody'] as const;
type ResponseTabType = ValuesOf<typeof responseTabs>;

export function ResponseInfo({ response }: { response: HistoricalEndpointResponse }) {
	const [tab, setTab] = useState<ResponseTabType>('responseBody');
	return (
		<>
			<Typography level="h2" textAlign={'center'}>
				{formatDate(response.dateTime)}
			</Typography>
			<Tabs
				aria-label="tabs"
				size="lg"
				value={tab}
				onChange={(_event, newValue) => {
					const newTabId = newValue as ResponseTabType;
					setTab(newTabId);
				}}
			>
				<TabList color="primary">
					{responseTabs.map((curTab, index) => (
						<Tab color={curTab === tab ? 'primary' : 'neutral'} value={curTab} key={index}>
							{camelCaseToTitle(curTab)}
						</Tab>
					))}
				</TabList>
				<TabPanel value={'responseBody'}>
					{response.response.statusCode}: {statusCodes[response.response.statusCode]}
					<ResponseBody response={response.response} />
				</TabPanel>
			</Tabs>
		</>
	);
}
