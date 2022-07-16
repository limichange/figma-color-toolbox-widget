const showToastButton = document.getElementById('showToastButton')
showToastButton.onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'showToast' } }, '*')
}

const closeButton = document.getElementById('closeButton')
closeButton.onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'close' } }, '*')
}
