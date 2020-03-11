// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";

var newFF = document.getElementById("newFF");
newFF.onkeyup = function(event) {
	if (event.keyCode == 13) {
		event.preventDefault();
		const flag = newFF.value.trim();

		chrome.storage.sync.get({ flags: [] }, function(data) {
			if (!data.flags) data.flags = [];
			if (data.flags.includes(flag)) return;

			data.flags.push(flag);
			chrome.storage.sync.set({ flags: data.flags }, function() {
				newFF.value = "";
				refreshList();
			});
		});
	}
};

refreshList();

function refreshList() {
	let bookmarkBoxList = document.getElementById("featureFlagList");
	chrome.storage.sync.get({ flags: [] }, function(data) {
		bookmarkBoxList.innerHTML = "";
		if (!data.flags) data.flags = [];

		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			var activeFeatureFlags = getActiveFeatureFlags(tabs[0].url);
			data.flags.forEach(element => {
				const ffRow = document.createElement("li");
				ffRow.classList.add("featureFlag");
				if (activeFeatureFlags.includes(element))
					ffRow.classList.add("selected");
				ffRow.textContent = element;

				const icon = document.createElement("img");
				icon.className = "removeImage";
				icon.src = "./images/remove.png";
				icon.width = 12;
				icon.onclick = function(e) {
					e.stopPropagation();
					e.preventDefault();
					chrome.storage.sync.get({ flags: [] }, function(data) {
						data.flags.splice(data.flags.indexOf(element), 1);
						chrome.storage.sync.set({ flags: data.flags });
						refreshList();
					});
				};

				ffRow.appendChild(icon);

				ffRow.onmousedown = function() {
					if (!ffRow.classList.contains("buttonMouseDown")) {
						ffRow.classList.add("buttonMouseDown");
					}
				};

				ffRow.onmouseup = function() {
					if (ffRow.classList.contains("buttonMouseDown")) {
						ffRow.classList.remove("buttonMouseDown");
					}
				};

				ffRow.onmouseleave = ffRow.onmouseup;

				ffRow.onclick = function() {
					if (ffRow.classList.contains("selected")) {
						ffRow.classList.remove("selected");
						removeFeatureFlag(element);
					} else {
						ffRow.classList.add("selected");
						addFeatureFlag(element);
					}
				};

				bookmarkBoxList.appendChild(ffRow);
			});
		});
	});
}

function addFeatureFlag(flag) {
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		var url = tabs[0].url;
		var flags = getActiveFeatureFlags(url);
		if (flags.includes(flag)) return;
		flags.push(flag);

		url = setFeatureFlags(url, flags);
		chrome.tabs.update({ url: url });
	});
}

function removeFeatureFlag(flag) {
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		var url = tabs[0].url;
		var flags = getActiveFeatureFlags(url);
		if (!flags.includes(flag)) return;
		flags.splice(flags.indexOf(flag), 1);

		url = setFeatureFlags(url, flags);
		chrome.tabs.update({ url: url });
	});
}

function getActiveFeatureFlags(url) {
	var regex = /[\?|\&](?<flag>([a-zA-Z]*)*)/g;
	var match;
	var result = [];
	while ((match = regex.exec(url)) != null) {
		const flag = match.groups.flag;
		if (flag) result.push(flag);
	}
	return result;
}

function setFeatureFlags(url, flags) {
	if (url.includes("?")) url = url.substr(0, url.indexOf("?"));

	for (let i = 0; i < flags.length; i++) {
		if (i == 0) {
			url += "?" + flags[i];
		} else {
			url += "&" + flags[i];
		}
	}
	return url;
}
