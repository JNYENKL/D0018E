document.addEventListener('DOMContentLoaded', e => {
	const atc = document.getElementById('addToCartLink');
	const atb = document.getElementById('addToCartButton');

	if (atc !== null && atb !== null) {
		atb.addEventListener('click', e => onStartChoice(atc, atb));
		atc.addEventListener('keypress', e => {
			if ((e.key = 'Enter')) onStartChoice(atc, atb);
		});
	}
});

const onStartChoice = (atc, atb) => {
	atb.disabled = true;
	atc.disabled = true;
};
