import { Avatar } from '@mui/joy';
import { minidenticon } from 'minidenticons';
import { useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types
interface TextAvatarProps extends Omit<React.ComponentProps<typeof Avatar>, 'src' | 'alt'> {
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
