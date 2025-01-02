import { useParticleThemeColor } from '@/hooks/useParticleThemeColor';
import { Box } from '@mui/joy';
import { PropsWithChildren, useEffect, useState } from 'react';
import ParticleEffectButton from 'react-particle-effect-button';

interface DissolvingButtonProps extends PropsWithChildren {
	shouldAnimate: boolean;
	clearShouldAnimate: () => void;
	height: string;
}

export function DissolvingButton({ children, shouldAnimate, clearShouldAnimate, height }: DissolvingButtonProps) {
	const particleColor = useParticleThemeColor();
	const [hidden, setHidden] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		if (isAnimating || !shouldAnimate) return;
		setHidden(true);
		clearShouldAnimate();
	}, [isAnimating, shouldAnimate]);

	return (
		<Box height={height}>
			<ParticleEffectButton
				hidden={hidden}
				canvasPadding={50}
				type="rectangle"
				color={particleColor}
				oscillationCoefficient={15}
				style="stroke"
				particlesAmountCoefficient={2}
				duration={350}
				speed={0.7}
				direction="top"
				easing="easeOutSine"
				onBegin={() => setIsAnimating(true)}
				size={4}
				onComplete={() => {
					if (hidden) {
						setTimeout(() => setHidden(false), 50);
					} else {
						setIsAnimating(false);
					}
				}}
			>
				{children}
			</ParticleEffectButton>
		</Box>
	);
}
