import { IconButton, Typography } from '@mui/joy';
import { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import FloatingLabelTextarea from './FloatingLabelTextArea';
import Markdown from 'react-markdown';

interface EditableTextAreaProps {
	text: string;
	setText: (text: string) => void;
	isValidFunc: (text: string) => boolean;
	label: string;
	renderAsMarkdown?: boolean;
}

export function EditableTextArea(props: EditableTextAreaProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [typingText, setTypingText] = useState(props.text);
	const [isValid, setIsValid] = useState(true);
	useEffect(() => {
		setIsValid(props.isValidFunc(typingText));
	}, [typingText, props.isValidFunc]);
	const decorator = (
		<div style={{ marginLeft: 'auto' }}>
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
		</div>
	);
	return isEditing ? (
		<FloatingLabelTextarea
			size={'md'}
			label={props.label}
			variant="outlined"
			value={typingText}
			onChange={(e) => setTypingText(e.target.value)}
			error={!isValid}
			endDecorator={decorator}
			startDecorator={decorator}
		/>
	) : (
		<div
			onClick={() => {
				setTypingText(props.text);
				setIsEditing(true);
			}}
		>
			{props.renderAsMarkdown ? (
				<Markdown>{props.text}</Markdown>
			) : (
				<Typography level="body-md" sx={{ textAlign: 'left' }}>
					{props.text}
				</Typography>
			)}
		</div>
	);
}
