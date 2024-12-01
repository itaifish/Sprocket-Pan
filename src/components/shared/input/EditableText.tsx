import { Box, IconButton, Input, Stack, TypographyProps } from '@mui/joy';
import { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { SprocketTooltip } from '../SprocketTooltip';
import { EllipsisTypography } from '../EllipsisTypography';

interface EditableTextProps extends Partial<TypographyProps> {
	text: string;
	setText: (text: string) => void;
	isValidFunc: (text: string) => boolean;
	narrow?: boolean;
}

export function EditableText({ text, setText, isValidFunc, sx, narrow = false, ...props }: EditableTextProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [typingText, setTypingText] = useState(text);
	const [isValid, setIsValid] = useState(true);
	useEffect(() => {
		setIsValid(isValidFunc(typingText));
	}, [typingText, isValidFunc]);

	const commitInput = () => {
		if (isValid) {
			setText(typingText);
			setIsEditing(false);
		}
	};

	const toggleEditing = () => {
		if (isEditing) {
			commitInput();
		} else {
			setTypingText(text);
			setIsEditing(true);
		}
	};

	return (
		<Stack
			direction="row"
			maxWidth={narrow ? '100%' : 'calc(100% - 100px)'}
			width="fit-content"
			alignItems="center"
			minHeight="2.5em"
			sx={sx}
		>
			<SprocketTooltip text={isEditing ? 'Save' : 'Edit'} sx={{ flexBasis: 0 }}>
				<IconButton onClick={toggleEditing} disabled={isEditing && !isValid} size="sm">
					{isEditing ? <CheckIcon /> : <ModeEditIcon />}
				</IconButton>
			</SprocketTooltip>
			<Box position="relative" flexGrow={1} width="100%" minWidth={0}>
				{isEditing && (
					<Input
						autoFocus
						sx={{
							zIndex: 100,
							position: 'absolute',
							left: 0,
							width: 'calc(100% + 50px)',
							minWidth: narrow ? 0 : '200px',
							height: '100%',
							'--Input-minHeight': '1.5em',
							'--Input-gap': 2,
						}}
						variant="soft"
						placeholder={text}
						value={typingText}
						onChange={(e) => setTypingText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								commitInput();
							}
						}}
						error={!isValid}
						endDecorator={
							<SprocketTooltip text="Cancel">
								<IconButton
									onClick={() => {
										setIsEditing(false);
									}}
									size="sm"
								>
									<CancelIcon />
								</IconButton>
							</SprocketTooltip>
						}
					/>
				)}
				<EllipsisTypography {...props}>{text}</EllipsisTypography>
			</Box>
		</Stack>
	);
}
