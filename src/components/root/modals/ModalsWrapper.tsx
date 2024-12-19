import { AdoptionModals } from './AdoptionModals';
import { CreateQueueModals } from './CreateQueueModals';
import { DeleteQueueModals } from './DeleteQueueModals';
import { DiffQueueModals } from './DiffQueueModals';

export function ModalsWrapper() {
	return (
		<>
			<DeleteQueueModals />
			<CreateQueueModals />
			<DiffQueueModals />
			<AdoptionModals />
		</>
	);
}
