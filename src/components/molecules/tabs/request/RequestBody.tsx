import { Select, Stack, Option, FormControl, FormLabel } from '@mui/joy';
import { EndpointRequest, RequestBodyTypes } from '../../../../types/application-data/application-data';
import JsonEditor from '../../../atoms/editor/JsonEditor';
import ListIcon from '@mui/icons-material/List';
import { Mode } from 'vanilla-jsoneditor';

export function RequestBody({ requestData }: { requestData: EndpointRequest }) {
	return (
		<>
			<Stack spacing={1}>
				<FormControl>
					<FormLabel id="select-body-type-label" htmlFor="select-body-type">
						Body Type
					</FormLabel>
					<Select
						value={requestData.bodyType}
						startDecorator={<ListIcon />}
						color="primary"
						sx={{ maxWidth: '250px' }}
						slotProps={{
							button: {
								id: 'select-body-type-button',
								// TODO: Material UI set aria-labelledby correctly & automatically
								// but Base UI and Joy UI don't yet.
								'aria-labelledby': 'select-body-type-label select-body-type-button',
							},
						}}
					>
						{RequestBodyTypes.map((type, index) => (
							<Option value={type} key={index}>
								{type}
							</Option>
						))}
					</Select>
				</FormControl>
				<JsonEditor mode={Mode.text} mainMenuBar={false} tabSize={3} indentation={'\t'} />
			</Stack>
		</>
	);
}
