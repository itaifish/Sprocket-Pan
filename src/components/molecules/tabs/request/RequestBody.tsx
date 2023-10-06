import { Select, Stack, Option, FormControl, FormLabel, Grid } from '@mui/joy';
import { EndpointRequest, RawBodyTypes, RequestBodyTypes } from '../../../../types/application-data/application-data';
import JsonEditor from '../../../atoms/editor/JsonEditor';
import ListIcon from '@mui/icons-material/List';
import { Mode } from 'vanilla-jsoneditor';
import { applicationDataManager } from '../../../../managers/ApplicationDataManager';
import DataObjectIcon from '@mui/icons-material/DataObject';

export function RequestBody({ requestData }: { requestData: EndpointRequest }) {
	return (
		<>
			<Stack spacing={1}>
				<FormControl>
					<Grid container spacing={1}>
						<Grid xs={6}>
							<FormLabel id="select-body-type-label" htmlFor="select-body-type">
								Body Type
							</FormLabel>
							<Select
								value={requestData.bodyType}
								startDecorator={<ListIcon />}
								color="primary"
								slotProps={{
									button: {
										id: 'select-body-type-button',
										// TODO: Material UI set aria-labelledby correctly & automatically
										// but Base UI and Joy UI don't yet.
										'aria-labelledby': 'select-body-type-label select-body-type-button',
									},
								}}
								onChange={(_e, value) => {
									if (value) {
										const update: Partial<EndpointRequest> = { bodyType: value };
										if (value === 'raw') {
											update.rawType = 'JSON';
										} else {
											update.rawType = undefined;
										}
										applicationDataManager.updateRequest(requestData.id, update);
									}
								}}
							>
								{RequestBodyTypes.map((type, index) => (
									<Option value={type} key={index}>
										{type}
									</Option>
								))}
							</Select>
						</Grid>
						<Grid xs={6}>
							{requestData.bodyType === 'raw' && (
								<>
									<FormLabel id="select-text-type-label" htmlFor="select-text-type">
										Text Type
									</FormLabel>
									<Select
										value={requestData.rawType ?? 'JSON'}
										startDecorator={<DataObjectIcon />}
										color="primary"
										slotProps={{
											button: {
												id: 'select-text-type-button',
												// TODO: Material UI set aria-labelledby correctly & automatically
												// but Base UI and Joy UI don't yet.
												'aria-labelledby': 'select-text-type-label select-text-type-button',
											},
										}}
										onChange={(_e, value) => {
											if (value) {
												applicationDataManager.updateRequest(requestData.id, { rawType: value });
											}
										}}
									>
										{RawBodyTypes.map((type, index) => (
											<Option value={type} key={index}>
												{type}
											</Option>
										))}
									</Select>
								</>
							)}
						</Grid>
					</Grid>
				</FormControl>
				{requestData.bodyType === 'raw' && requestData.rawType === 'JSON' && (
					<JsonEditor mode={Mode.text} mainMenuBar={false} tabSize={3} indentation={'\t'} />
				)}
			</Stack>
		</>
	);
}
