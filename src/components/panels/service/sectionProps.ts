import { Service } from '../../../types/application-data/application-data';

export interface SectionProps {
	data: Service;
	onChange: (data: Partial<Service>) => void;
}
