import { MonacoListener } from './MonacoListener';
import { RightClickListener } from './RightClickListener';

export function ListenerWrapper() {
	return (
		<>
			<MonacoListener />
			<RightClickListener />
		</>
	);
}
