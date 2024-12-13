import { SprocketEditor } from '@/components/shared/input/SprocketEditor';
import { Constants } from '@/constants/constants';
import { useDebounce } from '@/hooks/useDebounce';

interface RequestScriptProps {
	scriptText: string | undefined;
	scriptKey: 'preRequestScript' | 'postRequestScript';
	updateScript: (scriptText: string) => void;
}

export function RequestScript(props: RequestScriptProps) {
	const { localDataState, setLocalDataState } = useDebounce({
		state: props.scriptText ?? '',
		setState: (newText: string) => props.updateScript(newText),
		debounceOverride: Constants.longEditTimeMS,
	});

	return (
		<SprocketEditor
			height={'55vh'}
			value={localDataState}
			onChange={(value) => {
				if (value != null) {
					setLocalDataState(value);
				}
			}}
			language={'typescript'}
		/>
	);
}
