import { useEffect, useRef } from 'react';
import { DiffEditor, DiffEditorProps } from '@monaco-editor/react';
import { defaultEditorOptions } from '../../../managers/monaco/MonacoInitManager';
import { editor } from 'monaco-editor';
import { useEditorTheme } from '../../../hooks/useEditorTheme';

const diffOptions = { ...defaultEditorOptions, readOnly: true, domReadOnly: true, originalEditable: false };

export function DiffText({ original, modified, options, width, height, language, ...props }: DiffEditorProps) {
	const combinedOptions = { ...diffOptions, ...options };
	const editorTheme = useEditorTheme();
	const editorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
	const format = async () => {
		if (editorRef.current != null) {
			editorRef.current?.updateOptions({ ...combinedOptions, readOnly: false, originalEditable: true });
			const formatFirst = editorRef.current.getOriginalEditor().getAction('editor.action.formatDocument')?.run();
			const formatSecond = editorRef.current.getModifiedEditor().getAction('editor.action.formatDocument')?.run();
			await Promise.all([formatFirst, formatSecond]);
			editorRef.current?.updateOptions(combinedOptions);
		}
	};

	useEffect(() => {
		if (options != null) {
			editorRef.current?.updateOptions(combinedOptions);
		}
	}, [combinedOptions]);

	useEffect(() => {
		format();
	}, [original, modified]);

	return (
		<DiffEditor
			language={language ?? 'json'}
			theme={editorTheme}
			options={combinedOptions}
			onMount={(editor) => {
				editorRef.current = editor;
				format();
			}}
			original={original}
			modified={modified}
			width={width}
			height={height}
			{...props}
		/>
	);
}
