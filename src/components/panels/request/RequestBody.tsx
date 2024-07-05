import { Select, Option, FormControl, FormLabel, Stack } from '@mui/joy';
import ListIcon from '@mui/icons-material/List';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { useEffect, useRef, useState } from 'react';
import { updateRequest } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { EndpointRequest, RequestBodyTypes, RawBodyTypes } from '../../../types/application-data/application-data';
import { Constants } from '../../../utils/constants';
import { log } from '../../../utils/logging';
import { SprocketEditor } from '../../shared/input/SprocketEditor';

interface RequestBodyProps {
	request: EndpointRequest;
}

export function RequestBody({ request }: RequestBodyProps) {
	const [editorText, setEditorText] = useState(typeof request.body === 'string' ? request.body : '');
	const latestText = useRef(editorText);
	const isRaw = request.bodyType === 'raw';

	const dispatch = useAppDispatch();
	function update(values: Partial<EndpointRequest>) {
		dispatch(updateRequest({ ...values, id: request.id }));
	}
	// We update the text only after the user stops typing
	useEffect(() => {
		const delayDebounceFunc = setTimeout(() => {
			update({ body: latestText.current });
			log.info('update triggered');
		}, Constants.debounceTimeMS);

		return () => clearTimeout(delayDebounceFunc);
	}, [latestText.current]);

	const editorLanguage = isRaw && request.rawType != null ? request.rawType.toLocaleLowerCase() : undefined;

	return (
		<Stack gap={1}>
			<Stack direction="row" gap={2}>
				<FormControl sx={{ flexGrow: 1 }}>
					<FormLabel id="select-body-type-label" htmlFor="select-body-type">
						Body Type
					</FormLabel>
					<Select
						value={request.bodyType}
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
								const data: Partial<EndpointRequest> = { bodyType: value };
								if (value === 'raw') {
									data.rawType = 'JSON';
								} else {
									data.rawType = undefined;
								}
								update(data);
							}
						}}
					>
						{RequestBodyTypes.map((type, index) => (
							<Option value={type} key={index}>
								{type}
							</Option>
						))}
					</Select>
				</FormControl>
				{isRaw && (
					<FormControl sx={{ width: '200px' }}>
						<FormLabel id="select-text-type-label" htmlFor="select-text-type">
							Text Type
						</FormLabel>
						<Select
							value={request.rawType ?? 'JSON'}
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
									update({ rawType: value });
								}
							}}
						>
							{RawBodyTypes.map((type, index) => (
								<Option value={type} key={index}>
									{type}
								</Option>
							))}
						</Select>
					</FormControl>
				)}
			</Stack>
			{editorLanguage && (
				<SprocketEditor
					height={'45vh'}
					value={editorText}
					onChange={(value) => {
						setEditorText(value ?? '');
						latestText.current = value ?? '';
					}}
					language={editorLanguage}
				/>
			)}
		</Stack>
	);
}
