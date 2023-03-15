let domainList = [];

document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(["domainList"], function (result) {
    if (result.domainList) {
      domainList = result.domainList;
      displayDomains();
    }
  });

  const addDomainButton = document.getElementById("add-domain-button");
  addDomainButton.addEventListener("click", function () {
    const domainInput = document.getElementById("domain");
    const domain = domainInput.value.trim();
    if (domain !== "" && !domainList.includes(domain)) {
      domainList.push(domain);
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
        if (confirm(`Are you sure you want to remove ${domain}?`)) {
          domainList.splice(index, 1);
          displayDomains();
        }
      }
    });
  }
  

  const saveChangesButton = document.getElementById("save-changes-button");
  saveChangesButton.addEventListener("click", function () {
    chrome.storage.local.set({ domainList: domainList });
    const statusElement = document.getElementById("status");
    statusElement.textContent = "Changes saved.";
    setTimeout(function () {
      statusElement.textContent = "";
    }, 3000);
  });
});

function displayDomains() {
  const domainListElement = document.getElementById("saved-domains-list");
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
    
    // Add event listener to the newly created remove button
    removeButton.addEventListener("click", function () {
      const domain = removeButton.dataset.domain;
      const index = domainList.indexOf(domain);
      if (index !== -1) {
        domainList.splice(index, 1);
        displayDomains();
      }
    });
  }
}

