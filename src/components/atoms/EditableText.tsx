import { IconButton, Input, Typography } from '@mui/joy';
import { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { keepStringLengthReasonable } from '../../utils/string';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
interface EditableTextProps {
	text: string;
	setText: (text: string) => void;
	isValidFunc: (text: string) => boolean;
	isTitle?: boolean;
}

export function EditableText(props: EditableTextProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [typingText, setTypingText] = useState(props.text);
	const [isValid, setIsValid] = useState(true);
	useEffect(() => {
		setIsValid(props.isValidFunc(typingText));
	}, [typingText, props.isValidFunc]);
	return isEditing ? (
		<Input
			size={props.isTitle ? 'lg' : 'md'}
			sx={{
				maxWidth: props.isTitle ? '100%' : '600px',
				marginLeft: 'auto',
				marginRight: 'auto',
				width: props.isTitle ? '80%' : undefined,
			}}
			placeholder={props.isTitle ? `Enter your title here` : `${props.text}`}
			variant="outlined"
			value={typingText}
			onChange={(e) => setTypingText(e.target.value)}
			error={!isValid}
			endDecorator={
				<>
					<IconButton
						onClick={() => {
							setIsEditing(false);
						}}
						sx={{ marginRight: '2px' }}
					>
						<CancelIcon fontSize="large" />
					</IconButton>
					<IconButton
						onClick={() => {
							if (isValid) {
								props.setText(typingText);
								setIsEditing(false);
							}
						}}
						disabled={!isValid}
					>
						<CheckIcon fontSize="large" />
					</IconButton>
				</>
			}
		/>
	) : (
		<Typography
			level={props.isTitle ? `h2` : 'body-md'}
			sx={{ textAlign: 'center', ml: 'auto', mr: 'auto' }}
			onClick={() => {
				setTypingText(props.text);
				setIsEditing(true);
			}}
		>
			{<ModeEditIcon sx={{ verticalAlign: 'middle', pr: '5px' }} />}
			{keepStringLengthReasonable(props.text, props.isTitle ? 100 : 30)}
		</Typography>
	);
}
