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
	var distanceRange = document.getElementById("distanceRange");
	var distanceRangeValue = document.getElementById("distanceRangeValue");
	var addDomainBtn = document.getElementById("addDomainBtn");
	var deleteDomainBtn = document.getElementById("deleteDomainBtn");
	var domainTextareas = document.getElementById("domain");
	var emptyDomainBtn = document.getElementById("emptyDomainBtn");
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

	// 本地存储中获取 distanceRange 的值
	chrome.storage.local.get(["distanceRange"], function (result) {
		distanceRange.value = result.distanceRange;
		distanceRangeValue.textContent = result.distanceRange;
	});

	// 本地存储中获取 domainPauseDisplay 的值
	chrome.storage.local.get(["domainPauseDisplay"], function (result) {
		domainTextareas?.setAttribute("data-old", result.domainPauseDisplay.join("\n"));
		domainTextareas.value = result.domainPauseDisplay.join("\n");
	});

	// 监听开关的变化并将配置保存到本地存储
	toggleSwitch &&
		toggleSwitch.addEventListener("change", function () {
			if (!toggleSwitch || !status) {
				return;
			}
			chrome.storage.local.set({ enabled: toggleSwitch.checked });
			const message = toggleSwitch.checked ? `${chrome.i18n.getMessage('enable')}` : `${chrome.i18n.getMessage('disable')}`;

			showMessage(message);

			// 刷新当前页面
			refresh();
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
			chrome.storage.local.set({ alwaysShow: alwaysShow.checked });

			// 刷新当前页面
			refresh();
		});
	
	distanceRange &&
		distanceRange.addEventListener("input", function (e) {
			// 更新显示的值，转化成百分比
			let value = e.target.value;
			distanceRangeValue.textContent = value;
			chrome.storage.local.set({ distanceRange: distanceRange.value });

			// 刷新当前页面
			refresh();
		});
	
	addDomainBtn &&
		addDomainBtn.addEventListener("click", function () {
			// 获取当前tab的url
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				let url = tabs[0].url;
				if (url) {
					let domain = new URL(url).host;
					chrome.storage.local.get(["domainPauseDisplay"], function (result) {
						console.log('result', result);
						let domainPauseDisplay = result.domainPauseDisplay || [];
						if (domainPauseDisplay.indexOf(domain) === -1) {
							domainPauseDisplay.push(domain);
							chrome.storage.local.set({ domainPauseDisplay: domainPauseDisplay });
							domainTextareas.value = domainPauseDisplay.join("\n");
							domainTextareas?.setAttribute("data-old", domainPauseDisplay.join("\n"));

							refresh();
						}
					});
				}
			});
		});

	deleteDomainBtn &&
		deleteDomainBtn.addEventListener("click", function () {
			const oldValue = domainTextareas?.getAttribute("data-old");
			if (!oldValue) {
				return;
			}
			// 获取当前tab的url
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				let url = tabs[0].url;
				if (url) {
					let domain = new URL(url).host;
					chrome.storage.local.get(["domainPauseDisplay"], function (result) {
						console.log('result', result);
						let domainPauseDisplay = result.domainPauseDisplay || [];

						if (domainPauseDisplay.indexOf(domain) !== -1) {
							// 删除数组中的元素
							domainPauseDisplay.splice(domainPauseDisplay.indexOf(domain), 1);
							chrome.storage.local.set({ domainPauseDisplay: domainPauseDisplay });
							domainTextareas.value = domainPauseDisplay.join("\n");
							domainTextareas?.setAttribute("data-old", domainPauseDisplay.join("\n"));

							refresh();
						}
					});
				}
			});
		});

	emptyDomainBtn &&
		emptyDomainBtn.addEventListener("click", function () {
			const oldValue = domainTextareas?.getAttribute("data-old");
			if (!oldValue) {
				return;
			}
			chrome.storage.local.set({ domainPauseDisplay: [] });
			domainTextareas.value = "";

			refresh();
		});
	
	domainTextareas &&
		domainTextareas.addEventListener("blur", function (e) {
			let value = e.target.value;
			const oldValue = e.target.getAttribute("data-old");
			if (value === oldValue) {
				return;
			}
			let domainPauseDisplay = value.split("\n");
			// 去重
			domainPauseDisplay = Array.from(new Set(domainPauseDisplay));
			domainPauseDisplay = domainPauseDisplay.filter(item => item);
			domainTextareas.value = domainPauseDisplay.join("\n");

			chrome.storage.local.set({ domainPauseDisplay: domainPauseDisplay });

			// 刷新当前页面
			refresh();
		});
});

function refresh() {
	showMessage(`${chrome.i18n.getMessage('changed')}`);
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		if (!tabs[0].url) {
			return;
		}
		chrome.tabs.reload(tabs[0].id);
	});
}

function showMessage(message) {
	var status = document.getElementById("status");
	if (status) {
		status.textContent = message;
		setTimeout(() => {
			status.textContent = "";
		}, 1000);
	}
}
