// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";

refreshList();

const input = document.getElementById("newFF");
input.onkeyup = function(event) {
	if (event.keyCode === 13) {
		event.preventDefault();

		const flag = input.value.trim();

		if (flag) {
			chrome.storage.sync.get({ flags: [] }, function(data) {
				if (!data.flags) data.flags = [];
				if (data.flags.includes(flag)) return;

				data.flags.push(flag);
				chrome.storage.sync.set({ flags: data.flags }, function() {
					refreshList();
				});
			});

			input.value = "";
		}
	}
};

function refreshList() {
	chrome.storage.sync.get(["flags"], function(data) {
		let list = document.getElementById("list");
		list.innerHTML = "";
		if (!data.flags) data.flags = [];
		data.flags.sort().forEach(element => {
			const listItem = document.createElement("li");
			const label = document.createElement("p");
			label.textContent = element;
			label.style.fontSize = 16;
			const icon = document.createElement("img");
			icon.src = "./images/remove.png";
			icon.width = 16;
			listItem.appendChild(label);
			listItem.appendChild(icon);
			list.appendChild(listItem);
		});
	});
}
