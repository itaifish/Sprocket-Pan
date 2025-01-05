import { SprocketEditor } from '@/components/shared/input/monaco/SprocketEditor';
import { useDebounce } from '@/hooks/useDebounce';
import { Button, Stack } from '@mui/joy';
import { useState } from 'react';

interface OnChangeArgs {
	preRequestScript?: string;
	postRequestScript?: string;
}

interface PrePostScriptDisplayProps extends OnChangeArgs {
	onChange: (args: OnChangeArgs) => void;
}

const rhomboid = {
	clipPath: 'polygon(30px 0, 100% 0, 100% 100%, 0 100%)',
	height: '30px',
	width: '100%',
	borderRadius: 0,
};

export function PrePostScriptDisplay({ preRequestScript, postRequestScript, onChange }: PrePostScriptDisplayProps) {
	const [isPostActive, setIsPostActive] = useState(false);

	const { localDataState, setLocalDataState } = useDebounce({
		state: isPostActive ? postRequestScript : preRequestScript,
		setState: (text) => onChange(isPostActive ? { postRequestScript: text } : { preRequestScript: text }),
	});

	return (
		<SprocketEditor
			height="55vh"
			ActionBarItems={
				<Stack direction="row" minWidth="250px" width="400px">
					<Button
						sx={{ ...rhomboid, clipPath: '' }}
						variant="soft"
						color={isPostActive ? 'neutral' : 'primary'}
						onClick={() => {
							setIsPostActive(false);
							setLocalDataState(preRequestScript ?? '');
						}}
					>
						Pre-Request
					</Button>
					<Button
						sx={{ ...rhomboid, ml: '-30px' }}
						variant="soft"
						color={isPostActive ? 'primary' : 'neutral'}
						onClick={() => {
							setIsPostActive(true);
							setLocalDataState(postRequestScript ?? '');
						}}
					>
						Post-Request
					</Button>
				</Stack>
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
