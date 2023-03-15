let domainList = [];

document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(["domainList"], function (result) {
    if (result.domainList) {
      domainList = result.domainList;
      displayDomains();
    }
  });

  const addButton = document.getElementById("add-button");
  addButton.addEventListener("click", function () {
    const domainInput = document.getElementById("domain-input");
    const domain = domainInput.value.trim();
    if (domain !== "" && !domainList.includes(domain)) {
      domainList.push(domain);
      chrome.storage.local.set({ domainList: domainList });
      domainInput.value = "";
      displayDomains();
    }
  });

  const removeButtons = document.getElementsByClassName("remove-button");
  for (const removeButton of removeButtons) {
    removeButton.addEventListener("click", function () {
      const domain = removeButton.dataset.domain;
      const index = domainList.indexOf(domain);
      if (index !== -1) {
        domainList.splice(index, 1);
        chrome.storage.local.set({ domainList: domainList });
        displayDomains();
      }
    });
  }
});

function displayDomains() {
  const domainListElement = document.getElementById("domain-list");
  domainListElement.innerHTML = "";
  for (const domain of domainList) {
    const domainItem = document.createElement("li");
    const domainText = document.createTextNode(domain);
    domainItem.appendChild(domainText);
    const removeButton = document.createElement("button");
    removeButton.className = "remove-button";
    removeButton.setAttribute("data-domain", domain);
    removeButton.appendChild(document.createTextNode("Remove"));
    domainItem.appendChild(removeButton);
    domainListElement.appendChild(domainItem);
  }
}
