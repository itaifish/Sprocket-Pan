import { RESTfulRequestVerb } from '@/types/data/shared';
import chroma, { Color } from 'chroma-js';

const GET = chroma('#4d88ff');
const POST = chroma('#09aa3e');
const DELETE = chroma('#cc0000');
const PUT = chroma('#ffc800');
const PATCH = PUT;
const OPTIONS = chroma('#a6a6a6');
const HEAD = OPTIONS;
const OTHER = chroma('#909090');

function getColors(base: Color) {
	return {
		color: base.hex(),
		':hover': {
			color: base.brighten().hex(),
		},
	};
}

export const verbColors: Record<RESTfulRequestVerb | 'N/A', ReturnType<typeof getColors>> = {
	GET: getColors(GET),
	POST: getColors(POST),
	DELETE: getColors(DELETE),
	PUT: getColors(PUT),
	PATCH: getColors(PATCH),
	OPTIONS: getColors(OPTIONS),
	HEAD: getColors(HEAD),
	'N/A': getColors(OTHER),
};
