function initI18n() {
	let elements = document.querySelectorAll("[data-i18n]");
	for (const element of elements) {
		element.textContent = chrome.i18n.getMessage(element.dataset.i18n);
	}
}
document.addEventListener("DOMContentLoaded", function () {
	initI18n();
});
