function initI18n() {
	let elements = document.querySelectorAll("[data-i18n]");
	for (const element of elements) {
		element.textContent = chrome.i18n.getMessage(element.dataset.i18n);
	}
}
document.addEventListener("DOMContentLoaded", function () {
	var toggleSwitch = document.getElementById("toggleSwitch");
	var radioElements = document.querySelectorAll('[name="positon"]');
	var status = document.getElementById("status");
	var alwaysShow = document.getElementById("alwaysShow");
	initI18n();

	// 从本地存储中获取当前配置
	chrome.storage.local.get(["enabled"], function (result) {
		toggleSwitch.checked = result.enabled;
	});

	// 从本地存储中获取当前配置
	chrome.storage.local.get(["position"], function (result) {
		radioElements.forEach(function (element) {
			if (element.value === result.position) {
				element.checked = true;
			}
		});
	});

	// 本地存储中获取 alwaysShow 的值
	chrome.storage.local.get(["alwaysShow"], function (result) {
		alwaysShow.checked = result.alwaysShow;
	});

	// 监听开关的变化并将配置保存到本地存储
	toggleSwitch &&
		toggleSwitch.addEventListener("change", function () {
			if (!toggleSwitch || !status) {
				return;
			}
			chrome.storage.local.set({ enabled: toggleSwitch.checked });
			const message = toggleSwitch.checked ? `${chrome.i18n.getMessage('enable')}` : `${chrome.i18n.getMessage('disable')}`;

			status.textContent = message;

			// 刷新当前页面
			refresh();

			setTimeout(() => {
				status.textContent = "";
			}, 1000);
		});

	// 监听位置的变化并将配置保存到本地存储
	radioElements.forEach(function (element) {
		element.addEventListener("change", async function () {
			chrome.storage.local.set({ position: element.value });

			// 刷新当前页面
			refresh();
		});
	});

	// 监听 alwaysShow 的变化并将配置保存到本地存储
	alwaysShow &&
		alwaysShow.addEventListener("change", function () {
			if (!alwaysShow) {
				return;
			}
			chrome.storage.local.set({ alwaysShow: alwaysShow.checked });

			// 刷新当前页面
			refresh();
		});
});

function refresh() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.reload(tabs[0].id);
	});
}
