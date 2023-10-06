import { JSONEditor, JSONEditorPropsOptional } from 'vanilla-jsoneditor';
import { useEffect, useRef } from 'react';
import React from 'react';
import { useColorScheme } from '@mui/joy';
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';

export default function JsonEditor(props: JSONEditorPropsOptional) {
	const refContainer = useRef<React.LegacyRef<HTMLDivElement>>(null);
	const refEditor = useRef<JSONEditor | null>(null);
	const { mode } = useColorScheme();
	useEffect(() => {
		// create editor
		refEditor.current = new JSONEditor({
			target: refContainer.current as any,
			props: {},
		});

		return () => {
			// destroy editor
			if (refEditor.current) {
				refEditor.current.destroy();
				refEditor.current = null;
			}
		};
	}, []);

	// update props
	useEffect(() => {
		if (refEditor.current) {
			refEditor.current.updateProps(props ?? {});
		}
	}, [props]);

	return (
		<div
			style={{ maxHeight: '500px', overflowY: 'scroll', objectFit: 'cover' }}
			className={`vanilla-jsoneditor-react ${mode === 'dark' ? 'jse-theme-dark' : ''}`}
			ref={refContainer as any}
		></div>
	);
}
