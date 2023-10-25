document.addEventListener('DOMContentLoaded', function() {
  var toggleSwitch = document.getElementById('toggleSwitch');
  var radioElements = document.querySelectorAll('[name="positon"]');


  // 从本地存储中获取当前配置
  chrome.storage.local.get(['enabled'], function(result) {
    toggleSwitch.checked = result.enabled;
  });

  // 从本地存储中获取当前配置
  chrome.storage.local.get(['position'], function(result) {
    radioElements.forEach(function(element) {
      if (element.value === result.position) {
        element.checked = true;
      }
    });
  });

  // 监听开关的变化并将配置保存到本地存储
  toggleSwitch.addEventListener('change', function() {
    chrome.storage.local.set({ enabled: toggleSwitch.checked });
    const message = toggleSwitch.checked ? '已启用' : '已禁用';
    
    document.getElementById('status').textContent = message;

    // 刷新当前页面
    refresh();

    setTimeout(() => {
      document.getElementById('status').textContent = '';
    }, 1000);
  });
    
  // 监听位置的变化并将配置保存到本地存储
  radioElements.forEach(function(element) {
    element.addEventListener('change', async function() {
      chrome.storage.local.set({ position: element.value });

      // 刷新当前页面
      refresh();
    });
  });
});

function refresh() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.reload(tabs[0].id);
  });
}