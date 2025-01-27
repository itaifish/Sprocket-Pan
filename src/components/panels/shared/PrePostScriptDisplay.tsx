import { ButtonTabs } from '@/components/shared/ButtonTabs';
import { SprocketEditor } from '@/components/shared/input/monaco/SprocketEditor';
import { useDebounce } from '@/hooks/useDebounce';
import { useState } from 'react';

interface OnChangeArgs {
	preRequestScript?: string;
	postRequestScript?: string;
}

interface PrePostScriptDisplayProps extends OnChangeArgs {
	onChange: (args: OnChangeArgs) => void;
}

export function PrePostScriptDisplay({ preRequestScript, postRequestScript, onChange }: PrePostScriptDisplayProps) {
	const [isPostActive, setIsPostActive] = useState(false);

	const { localDataState, setLocalDataState } = useDebounce({
		state: isPostActive ? postRequestScript : preRequestScript,
		setState: (text) => onChange(isPostActive ? { postRequestScript: text } : { preRequestScript: text }),
	});

	const onButtonTabChange = (index: number) => {
		const isPostActive = !!index;
		setIsPostActive(isPostActive);
		setLocalDataState((isPostActive ? postRequestScript : preRequestScript) ?? '');
	};

	return (
		<SprocketEditor
			height="calc(100vh - 300px)"
			ActionBarItems={
				<ButtonTabs tabs={[{ title: 'Pre-Request' }, { title: 'Post-Request' }]} onChange={onButtonTabChange} />
			}
			value={localDataState}
			onChange={(value) => {
				if (value != null) {
					setLocalDataState(value);
				}
			}}
			language="typescript"
		/>
	);
}
