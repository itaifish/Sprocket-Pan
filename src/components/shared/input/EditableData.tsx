import { Badge, Box, IconButton } from '@mui/joy';
import { useState, useRef } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { Editor } from '@monaco-editor/react';
import { defaultEditorOptions } from '../../../managers/monaco/MonacoInitManager';
import { clamp } from '../../../utils/math';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { useSelector } from 'react-redux';
import { selectEnvironments, selectSelectedEnvironment } from '../../../state/active/selectors';
import { editor } from 'monaco-editor';
import { SprocketTooltip } from '../SprocketTooltip';
import { CopyToClipboardButton } from '../buttons/CopyToClipboardButton';
import { KeyValuePair, KeyValueValues } from '../../../classes/OrderedKeyValuePairs';
import { replaceValuesByKey } from '../../../utils/variables';
import { FormatButton } from '../buttons/FormatButton';
import { useEditorTheme } from '../../../hooks/useEditorTheme';
import { ActionBar, ActionBarPassthroughProps } from './ActionBar';

export function parseEditorJSON<T>(text: string): Record<string, T> {
	if (text === '') return {};
	return JSON.parse(text) as Record<string, T>;
}

export function toEditorJSON<T extends KeyValueValues>(values: KeyValuePair<T>[]): string {
	return JSON.stringify(Object.fromEntries(values.map(({ key, value }) => [key, value])));
}

export interface EditableDataSettings {
	fullSize?: boolean;
	envPairs?: KeyValuePair[];
}

interface EditableDataProps<T extends KeyValueValues> extends EditableDataSettings {
	initialValues: KeyValuePair<T>[];
	onChange: (newData: KeyValuePair<T>[]) => void;
	actions?: ActionBarPassthroughProps;
	viewParser?: (text: string) => string;
}

/**
 * @todo this won't format data if the values are updated. it'll run everything except the onChange from the editor
 * which prevents us from getting the updated text.
 * in order to reset initialValues, you'll need to teardown and re-render this entire component
 */
export function EditableData<T extends KeyValueValues>({
	initialValues,
	onChange,
	fullSize,
	envPairs,
	actions = {},
	viewParser,
}: EditableDataProps<T>) {
	const theme = useEditorTheme();

	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const environments = useSelector(selectEnvironments);
	const envValues = envPairs ?? (selectedEnvironment == null ? [] : environments[selectedEnvironment].pairs);

	const [editorText, setEditorText] = useState(toEditorJSON(initialValues));
	const [hasChanged, setChanged] = useState(false);
	const [isReadOnly, setIsReadOnly] = useState(false);
	const [isFormatting, setIsFormatting] = useState(false);

	const ignoreEditorUpdates = useRef<boolean>(false);
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

	const format = async () => {
		const prevIgnore = ignoreEditorUpdates.current;
		const prevReadOnly = editorRef.current?.getRawOptions().readOnly;
		setIsFormatting(true);
		ignoreEditorUpdates.current = true;
		editorRef.current?.updateOptions({ readOnly: false });
		await editorRef.current?.getAction('editor.action.formatDocument')?.run();
		editorRef.current?.updateOptions({ readOnly: prevReadOnly });
		ignoreEditorUpdates.current = prevIgnore;
	};

	const reset = () => {
		setEditorText(toEditorJSON(initialValues));
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
		ignoreEditorUpdates.current = !isReadOnly;
		if (isReadOnly) {
			editorRef.current?.updateOptions({ readOnly: false });
			editorRef.current?.setValue(editorText);
		} else {
			editorRef.current?.setValue(
				viewParser == null ? replaceValuesByKey(editorText, envValues) : viewParser(editorText),
			);
		}
		setIsReadOnly(!isReadOnly);
		format();
	};

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
			<ActionBar
				start={actions.start}
				end={
					<>
						{actions.end}
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
						<FormatButton disabled={isReadOnly} onClick={format} />
					</>
				}
			>
				{actions.middle}
			</ActionBar>
			<Box
				onKeyDown={(e) => {
					if (e.key === 's' && e.ctrlKey) {
						save();
					}
				}}
				height={'100%'}
			>
				<Editor
					height={fullSize ? '100%' : `${clamp((initialValues.length + 2) * 3, 10, 40)}vh`}
					value={editorText}
					onChange={onEditorChange}
					language={'json'}
					theme={theme}
					options={defaultEditorOptions}
					onMount={(editor) => {
						editorRef.current = editor;
						format();
					}}
				/>
			</Box>
		</>
	);
}
