import { Select, Stack, Option, FormControl, FormLabel, Grid } from '@mui/joy';
import ListIcon from '@mui/icons-material/List';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { Editor, Monaco } from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';
import { defaultEditorOptions } from '../../../managers/MonacoInitManager';
import { updateRequest } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { EndpointRequest, RequestBodyTypes, RawBodyTypes } from '../../../types/application-data/application-data';
import { Constants } from '../../../utils/constants';
import { log } from '../../../utils/logging';
import { FormatIcon } from '../../shared/buttons/FormatIcon';
import { useEditorTheme } from '../../../hooks/useEditorTheme';

export function RequestBody({ requestData }: { requestData: EndpointRequest }) {
	const editorTheme = useEditorTheme();
	const [editor, setEditor] = useState<string | undefined>(undefined);
	const [editorText, setEditorText] = useState(typeof requestData.body === 'string' ? requestData.body : '');
	const latestText = useRef(editorText);
	const editorRef = useRef<any>(null);
	const format = () => {
		if (editorRef.current) {
			editorRef.current.getAction('editor.action.formatDocument').run();
		}
	};
	const handleEditorDidMount = (editor: any, _monaco: Monaco) => {
		editorRef.current = editor;
		format();
	};
	const dispatch = useAppDispatch();
	function update(values: Partial<EndpointRequest>) {
		dispatch(updateRequest({ ...values, id: requestData.id }));
	}
	// We update the text only after the user stops typing
	useEffect(() => {
		const delayDebounceFunc = setTimeout(() => {
			update({ body: latestText.current });
			log.info('update triggered');
		}, Constants.debounceTimeMS);

		return () => clearTimeout(delayDebounceFunc);
	}, [latestText.current]);

	useEffect(() => {
		if (requestData.bodyType === 'raw') {
			if (requestData.rawType != undefined) {
				const newEditor = requestData.rawType.toLocaleLowerCase();
				setEditor(newEditor);
			}
		} else {
			setEditor(undefined);
		}
	}, [requestData.rawType, requestData.bodyType]);

	return (
		<Stack spacing={1}>
			<Grid container spacing={1}>
				<Grid xs={6}>
					<FormControl>
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
				</Grid>
				<Grid xs={5}>
					{requestData.bodyType === 'raw' && (
						<FormControl>
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
				</Grid>
				<Grid xs={1}>{requestData.bodyType === 'raw' && <FormatIcon actionFunction={() => format()} />}</Grid>
			</Grid>
			{editor && (
				<Editor
					height={'45vh'}
					value={editorText}
					onChange={(value) => {
						setEditorText(value ?? '');
						latestText.current = value ?? '';
					}}
					language={editor}
					theme={editorTheme}
					options={defaultEditorOptions}
					onMount={handleEditorDidMount}
				/>
			)}
		</Stack>
	);
}
