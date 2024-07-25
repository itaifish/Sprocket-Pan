import { ReactNode, useEffect, useRef } from 'react';
import { DiffEditor, DiffEditorProps, Editor, EditorProps, Monaco } from '@monaco-editor/react';
import { defaultEditorOptions } from '../../../managers/MonacoInitManager';
import { editor } from 'monaco-editor';
import { useEditorTheme } from '../../../hooks/useEditorTheme';
import { Box, Stack } from '@mui/joy';
import { EditorActions } from './EditorActions';

type SprocketEditorProps<TEditorProps extends EditorProps | DiffEditorProps, TIsDiff> = Omit<
	TEditorProps,
	'onMount'
> & {
	ActionBarItems?: ReactNode;
	formatOnChange?: boolean;
	isDiff?: TIsDiff;
	onChange?: TIsDiff extends true ? never : EditorProps['onChange'];
};

export function SprocketEditor<TIsDiff extends boolean | undefined = undefined>({
	ActionBarItems = <Box />,
	formatOnChange = false,
	isDiff = false,
	...overrides
}: SprocketEditorProps<TIsDiff extends true ? DiffEditorProps : EditorProps, TIsDiff>) {
	const allEditorOptions = { ...defaultEditorOptions, ...overrides.options };
	const editorTheme = useEditorTheme();
	const editorRef = useRef<editor.IStandaloneCodeEditor | editor.IStandaloneDiffEditor | null>(null);
	const value = (overrides as EditorProps)?.value ?? (overrides as DiffEditorProps).original;
	const format = async () => {
		if (editorRef.current != null) {
			let action: () => Promise<void>;
			if (!isDiff) {
				const current = editorRef.current as editor.IStandaloneCodeEditor;
				action = async () => current?.getAction('editor.action.formatDocument')?.run();
			} else {
				const current = editorRef.current as editor.IStandaloneDiffEditor;
				action = async () => {
					const formatFirst = current.getOriginalEditor().getAction('editor.action.formatDocument')?.run();
					const formatSecond = current.getModifiedEditor().getAction('editor.action.formatDocument')?.run();
					await Promise.all([formatFirst, formatSecond]);
				};
			}
			if (overrides?.options?.readOnly) {
				editorRef.current?.updateOptions({ ...allEditorOptions, readOnly: false, originalEditable: true });
				await action();
				editorRef.current?.updateOptions({ ...allEditorOptions, readOnly: true, originalEditable: false });
			} else {
				await action();
			}
		}
	};

	const handleEditorDidMount = (
		editor: editor.IStandaloneCodeEditor | editor.IStandaloneDiffEditor,
		_monaco: Monaco,
	) => {
		editorRef.current = editor;
		format();
	};

	useEffect(() => {
		if (overrides?.options != null) {
			editorRef.current?.updateOptions(allEditorOptions);
		}
	}, [allEditorOptions]);

	useEffect(() => {
		if (formatOnChange) format();
	}, [value, editorRef.current, formatOnChange]);

	const EditorType = isDiff ? DiffEditor : Editor;

	return (
		<Box>
			<Stack direction="row" justifyContent="space-between" alignItems="end">
				{ActionBarItems}
				<EditorActions copyText={isDiff ? undefined : value} format={format} />
			</Stack>
			<EditorType
				language={'typescript'}
				theme={editorTheme}
				options={allEditorOptions}
				onMount={handleEditorDidMount}
				value={value}
				{...overrides}
			/>
		</Box>
	);
}
