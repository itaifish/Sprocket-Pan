import { Avatar, AvatarProps } from '@mui/joy';
import { minidenticon } from 'minidenticons';
import { useMemo } from 'react';

interface MinidenticonProps {
	username: string;
}

interface TextAvatarProps extends Omit<AvatarProps, 'src' | 'alt'> {
	username: string;
	saturation?: number | string;
	lightness?: number | string;
}

export function TextAvatar({ username, saturation, lightness, ...props }: TextAvatarProps) {
	const svgURI = useMemo(
		() => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(username, saturation, lightness)),
		[username, saturation, lightness],
	);
	return <Avatar src={svgURI} alt={username} {...props} />;
}

export function Minidenticon({ username }: MinidenticonProps) {
	const svgURI = useMemo(() => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(username, 60)), [username]);
	return <img src={svgURI} />;
}
