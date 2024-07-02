import { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { initMonaco, setMonacoInjectedTypeCode } from '../managers/MonacoInitManager';
import { selectScripts } from '../state/active/selectors';

export function MonacoListener() {
	const monaco = useMonaco();
	const scripts = useSelector(selectScripts);

	const scriptCalls = Object.values(scripts).map(
		(x) => `${x.scriptCallableName}${JSON.stringify(x.returnVariableType)}`,
	);
	useEffect(() => {
		if (monaco) {
			initMonaco(monaco);
		}
	}, [monaco]);

	useEffect(() => {
		if (monaco) {
			setMonacoInjectedTypeCode(monaco, Object.values(scripts));
		}
	}, [monaco, scripts]);

	return <></>;
}
