import { useLayoutEffect, useRef } from 'react';

export const useFirstRender = () => {
	const firstRender = useRef(true);

	useLayoutEffect(() => {
		if (firstRender.current) {
			console.log('this is the first render');
			firstRender.current = false;
		}
		return;
	});

	return firstRender.current;
};

export default { useFirstRender };
