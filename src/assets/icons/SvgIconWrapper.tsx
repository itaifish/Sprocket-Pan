import { SvgIcon, SvgIconProps } from '@mui/joy';
import { ReactNode, SVGProps } from 'react';

export function SvgWrapper(path: React.ReactNode, viewBox: number) {
	const svgIcon = (props: SvgIconProps) => (
		<SvgIcon {...props}>
			<svg xmlns="http://www.w3.org/2000/svg" width={viewBox} viewBox={`0 0 ${viewBox} ${viewBox}`} {...props}>
				{path}
			</svg>
		</SvgIcon>
	);
	svgIcon.displayName = 'SvgIcon';
	return svgIcon;
}

export function PlainSvgWrapper(path: ReactNode, viewBox: number) {
	const svg = (props: SVGProps<SVGSVGElement>) => (
		<svg xmlns="http://www.w3.org/2000/svg" width={viewBox} viewBox={`0 0 ${viewBox} ${viewBox}`} {...props}>
			{path}
		</svg>
	);
	svg.displayName = 'Svg';
	return svg;
}

export function SvgVariantsWrapper(path: ReactNode, viewBox: number) {
	return { SvgIcon: SvgWrapper(path, viewBox), Svg: PlainSvgWrapper(path, viewBox) };
}
