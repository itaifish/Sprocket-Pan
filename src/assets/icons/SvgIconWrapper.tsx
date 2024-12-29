import { SvgIcon, SvgIconProps } from '@mui/joy';

export function SvgWrapper(svg: React.ReactNode) {
	const svgIcon = (props: SvgIconProps) => <SvgIcon {...props}>{svg}</SvgIcon>;
	svgIcon.displayName = 'SvgIcon';
	return svgIcon;
}
