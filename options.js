// Get the HTML elements we need to access
const termsInput = document.getElementById('terms');
const objectsSelect = document.getElementById('objects');
const replyInput = document.getElementById('reply');
const saveButton = document.getElementById('save');

// Load the saved options
chrome.storage.sync.get(['terms', 'objects', 'reply'], (result) => {
  termsInput.value = result.terms || '';
  objectsSelect.value = result.objects || [];
  replyInput.value = result.reply || '';
});

// Save the options when the Save button is clicked
saveButton.addEventListener('click', () => {
  const terms = termsInput.value;
  const objects = Array.from(objectsSelect.selectedOptions, (option) => option.value);
  const reply = replyInput.value;

  chrome.storage.sync.set({ terms, objects, reply }, () => {
    alert('Options saved');
  });
});
