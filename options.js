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
  

// Save the new options in chrome.storage.local
const saveChangesButton = document.getElementById("save-changes-button");
saveChangesButton.addEventListener("click", function () {
  const sobjects = document.getElementById("sobjects").value.split(',').map(s => s.trim());
  const profiles = document.getElementById("profiles").value.split(',').map(p => p.trim());
  const keywords = document.getElementById("keywords").value.split(',').map(k => k.trim());
  const response = document.getElementById("response").value;
  const scanInterval = document.getElementById("scanInterval").value;
  chrome.storage.local.set({ 
    domainList: domainList, 
    sobjects: sobjects,
    profiles: profiles,
    keywords: keywords,
    response: response,
    scanInterval: parseInt(scanInterval, 10)
  });
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

