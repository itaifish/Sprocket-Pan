import { Select, Option, FormControl, FormLabel, Stack } from '@mui/joy';
import ListIcon from '@mui/icons-material/List';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { useEffect, useRef, useState } from 'react';
import { updateRequest } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import {
	EndpointRequest,
	RequestBodyTypes,
	RawBodyTypes,
	getRequestBodyCategory,
} from '../../../types/application-data/application-data';
import { SprocketEditor } from '../../shared/input/SprocketEditor';
import { EditableFormTable } from '../../shared/input/EditableFormTable';
import { Constants } from '../../../constants/constants';

interface RequestBodyProps {
	request: EndpointRequest;
}

export function RequestBody({ request }: RequestBodyProps) {
	const [editorText, setEditorText] = useState(typeof request.body === 'string' ? request.body : '');
	const latestText = useRef(editorText);
	const requestBodyCategory = getRequestBodyCategory(request.bodyType);
	const isRaw = requestBodyCategory === 'raw';
	const isTable = requestBodyCategory === 'table';
	const dispatch = useAppDispatch();
	function update(values: Partial<EndpointRequest>) {
		dispatch(updateRequest({ ...values, id: request.id }));
	}
	// We update the text only after the user stops typing
	useEffect(() => {
		const delayDebounceFunc = setTimeout(() => {
			if (isRaw) {
				update({ body: latestText.current });
			}
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
								const bodyIsString = typeof request.body === 'string';
								const bodyIsNullish = request.body == undefined;
								const bodyIsTable = !bodyIsString && !bodyIsNullish;
								if (bodyIsTable && value === 'raw') {
									try {
										data.body = JSON.stringify(request.body);
									} catch (e) {
										data.body = '';
									}
								} else if (bodyIsString && getRequestBodyCategory(value) === 'table') {
									data.body = '';
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
			{isTable && (
				<EditableFormTable
					data={request.body as Record<string, string>}
					setData={(newData) => update({ body: newData })}
				/>
			)}
		</Stack>
	);
}
