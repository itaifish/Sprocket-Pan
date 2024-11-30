import { Badge, Box, IconButton, Stack, useColorScheme } from '@mui/joy';
import { useState, useRef, useMemo, useEffect } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { Editor, Monaco } from '@monaco-editor/react';
import { defaultEditorOptions } from '../../../managers/MonacoInitManager';
import { clamp } from '../../../utils/math';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { useSelector } from 'react-redux';
import { selectEnvironments, selectSelectedEnvironment } from '../../../state/active/selectors';
import { editor } from 'monaco-editor';
import { SprocketTooltip } from '../SprocketTooltip';
import { CopyToClipboardButton } from '../buttons/CopyToClipboardButton';
import { KeyValuePair, KeyValueValues } from '../../../classes/OrderedKeyValuePairs';
import { getEditorTheme } from '../../../utils/style';
import { replaceValuesByKey } from '../../../utils/variables';
import { FormatButton } from '../buttons/FormatButton';

function parseEditorJSON<T>(text: string): Record<string, T> {
	if (text === '') return {};
	return JSON.parse(text) as Record<string, T>;
}

export interface EditableDataSettings {
	fullSize?: boolean;
	envPairs?: KeyValuePair[];
}

interface EditableDataProps<T extends KeyValueValues> extends EditableDataSettings {
	values: KeyValuePair<T>[];
	onChange: (newData: KeyValuePair<T>[]) => void;
}

export function EditableData<T extends KeyValueValues>({ values, onChange, fullSize, envPairs }: EditableDataProps<T>) {
	const theme = getEditorTheme(useColorScheme());

	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const environments = useSelector(selectEnvironments);
	const envValues = envPairs ?? (selectedEnvironment == null ? [] : environments[selectedEnvironment].pairs);
	const valuesAsObject = useMemo(() => Object.fromEntries(values.map(({ key, value }) => [key, value])), [values]);

	const [editorText, setEditorText] = useState(JSON.stringify(valuesAsObject));
	const [hasChanged, setChanged] = useState(false);
	const [isFormatting, setIsFormatting] = useState(false);
	const [isReadOnly, setIsReadOnly] = useState(false);

	const ignoreEditorUpdates = useRef<boolean>(false);
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

	const format = () => {
		editorRef.current?.getAction('editor.action.formatDocument')?.run();
		setIsFormatting(true);
	};

	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, _monaco: Monaco) => {
		editorRef.current = editor;
		format();
	};

	const reset = () => {
		setEditorText(JSON.stringify(valuesAsObject));
		setChanged(false);
		format();
	};

	const save = () => {
		const tableData = parseEditorJSON<T>(editorText);
		if (tableData != null) {
			onChange(Object.entries(tableData).map(([key, value]) => ({ key, value })));
			setChanged(false);
			format();
		}
	};

	const switchMode = () => {
		if (isReadOnly) {
			// if current mode isReadOnly, switching to false (edit) mode
			editorRef.current?.updateOptions({ readOnly: false });
			editorRef.current?.setValue(editorText);
			ignoreEditorUpdates.current = false;
			setIsReadOnly(false);
		} else {
			// else switching to true (view) mode
			setIsReadOnly(true);
			ignoreEditorUpdates.current = true;
			editorRef.current?.setValue(replaceValuesByKey(editorText, envValues));
			editorRef.current?.updateOptions({ readOnly: true });
		}
	};

	useEffect(() => {
		ignoreEditorUpdates.current = isReadOnly;
	}, [isReadOnly]);

	const onEditorChange = (value: string | undefined) => {
		if (ignoreEditorUpdates.current) return;
		setEditorText(value ?? '');
		if (isFormatting) {
			setIsFormatting(false);
		} else {
			setChanged(true);
		}
	};

	return (
		<>
			<Stack direction="row" justifyContent="end" alignItems="end">
				<SprocketTooltip text={`Switch to ${isReadOnly ? 'Edit' : 'View'} Mode`}>
					<IconButton onClick={switchMode}>{isReadOnly ? <EditIcon /> : <VisibilityIcon />}</IconButton>
				</SprocketTooltip>
				<SprocketTooltip text="Clear Changes">
					<IconButton disabled={!hasChanged} onClick={reset}>
						<CancelIcon />
					</IconButton>
				</SprocketTooltip>
				<SprocketTooltip text="Save Changes">
					<IconButton disabled={!hasChanged} onClick={save}>
						<Badge invisible={!hasChanged} color="primary">
							<SaveIcon></SaveIcon>
						</Badge>
					</IconButton>
				</SprocketTooltip>
				<CopyToClipboardButton copyText={editorText} />
				<FormatButton disabled={isReadOnly} onChange={format} />
			</Stack>
			<Box
				onKeyDown={(e) => {
					if (e.key === 's' && e.ctrlKey) {
						save();
					}
				}}
				height={'100%'}
			>
				<Editor
					height={fullSize ? '100%' : `${clamp((values.length + 2) * 3, 10, 40)}vh`}
					value={editorText}
					onChange={onEditorChange}
					language={'json'}
					theme={theme}
					options={defaultEditorOptions}
					onMount={handleEditorDidMount}
				/>
			</Box>
		</>
	);
}
