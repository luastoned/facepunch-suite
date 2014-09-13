// ==UserScript==
// @name        Facepunch Suite
// @namespace   @LuaStoned
// @description Make browsing Facepunch a little more enjoyable
// @include     http*://*facepunch.com/showthread*
// @include     http*://*facepunch.com/threads*
// @version     1.0
// @grant       none
// ==/UserScript==

var FPSuite =
{
	// Utility functions and helpers
	getValue: function(str)
	{
		if (!localStorage.hasOwnProperty("FPS_" + str))
			localStorage.setItem("FPS_" + str, JSON.stringify(true));
		
		var jsonStr = localStorage.getItem("FPS_" + str);
		return JSON.parse(jsonStr);
	},
	
	setValue: function(str, obj)
	{
		var jsonStr = JSON.stringify(obj)
		localStorage.setItem("FPS_" + str, jsonStr);
	},
	
	httpGet: function(url, callback)
	{
		var xhr = new XMLHttpRequest();
		xhr.onload = function(e)
		{
			if (this.status == 200)
				callback(this.responseText);
		}
		
		xhr.open("GET", url);
		xhr.send();
	},
	
	scrollToElement: function(pageElement)
	{    
		var positionX = 0;
		var positionY = 0;    

		while (pageElement != null)
		{        
			positionX += pageElement.offsetLeft;        
			positionY += pageElement.offsetTop;        
			pageElement = pageElement.offsetParent;        
			window.scrollTo(positionX, positionY);    
		}
	},
	
	runCode: function()
	{
		this.createSettings();
		
		if (this.getValue("ResizeUserTitles"))
			this.resizeUserTitles();
		
		if (this.getValue("VimScroll"))
			this.vimScroll();
		
		if (this.getValue("ThreadDiscover"))
			this.threadDiscover();
	},
	
	createSettings: function()
	{
		var navBar = document.getElementById("navbarlinks");
		
		var linkDiv = document.createElement("div");
		linkDiv.classList.add("navbarlink");
		
		var linkImg = document.createElement("img");
		linkImg.src = "fp/navbar/more.png";

		var suiteSettings = document.createElement("a");
		suiteSettings.textContent = "FP Suite";
		suiteSettings.id = "suiteSettings";
		suiteSettings.href = "#";
		suiteSettings.onclick = this.openSettings;
		
		suiteSettings.appendChild(linkImg);
		linkDiv.appendChild(suiteSettings);
		navBar.appendChild(linkDiv);
	},
	
	openSettings: function()
	{
		var settingsDiv = document.getElementById("FPSSettings");
		if (!settingsDiv)
		{
			settingsDiv = CreateFloatingDiv(unsafeWindow.MouseX, unsafeWindow.MouseY, "FPSSettings", ""); // x, y, id, class
			settingsDiv.style.width = "140px";
			
			var closeDiv = document.createElement("div");
			closeDiv.style.cssFloat = "right";
			
			var closeButton = document.createElement("a");
			closeButton.href = "#";
			closeButton.onclick = function() {
				settingsDiv.style.display = "none";
				return false;
			}
			
			var closeImg = document.createElement("img");
			closeImg.src = "fp/close.png";
			
			settingsDiv.appendChild(closeDiv);
			closeDiv.appendChild(closeButton);
			closeButton.appendChild(closeImg);

			var settingsInfo = document.createElement("p");
			settingsInfo.textContent = "FP Suite Settings";
			settingsInfo.style.fontWeight = "bold";
			settingsDiv.appendChild(settingsInfo);
			
			var checkBox1 = document.createElement("input");
			checkBox1.type = "checkbox";
			checkBox1.style.margin = "4px 4px 0px 0px";
			checkBox1.checked = FPSuite.getValue("ResizeUserTitles");
			checkBox1.onchange = function() {
				FPSuite.setValue("ResizeUserTitles", this.checked);
			}
			settingsDiv.appendChild(checkBox1);
			
			var checkBox1Text = document.createTextNode("Resize Titles");
			settingsDiv.appendChild(checkBox1Text);
			settingsDiv.appendChild(document.createElement("br"));
			
			var checkBox2 = document.createElement("input");
			checkBox2.type = "checkbox";
			checkBox2.style.margin = "2px 4px 0px 0px";
			checkBox2.checked = FPSuite.getValue("VimScroll");
			checkBox2.onchange = function() {
				FPSuite.setValue("VimScroll", this.checked);
			}
			settingsDiv.appendChild(checkBox2);
			
			var checkBox2Text = document.createTextNode("Vim Scroll");
			settingsDiv.appendChild(checkBox2Text);
			settingsDiv.appendChild(document.createElement("br"));
			
			var checkBox3 = document.createElement("input");
			checkBox3.type = "checkbox";
			checkBox3.style.margin = "2px 4px 4px 0px";
			checkBox3.checked = FPSuite.getValue("ThreadDiscover");
			checkBox3.onchange = function() {
				FPSuite.setValue("ThreadDiscover", this.checked);
			}
			settingsDiv.appendChild(checkBox3);
			
			var checkBox3Text = document.createTextNode("Thread Discover");
			settingsDiv.appendChild(checkBox3Text);
			settingsDiv.appendChild(document.createElement("br"));

			var sourceLink = document.createElement("a");
			sourceLink.href = "https://github.com/luastoned/facepunch-suite";
			sourceLink.target = "_blank";
			sourceLink.textContent = "SourceCode on GitHub";
			settingsDiv.appendChild(sourceLink);
		}

		if (!settingsDiv)
			return false;
		
		settingsDiv.style.display = "block";
		return false;
	},
	
	// Enhancement functions
	resizeUserTitles: function()
	{
		var userTitles = document.getElementsByClassName("usertitle");
		for (var i = 0; i < userTitles.length; i++)
		{
			userTitles[i].style.fontSize = "10px";
			
			var fontTags = userTitles[i].getElementsByTagName("font");
			for (var j = 0; j < fontTags.length; j++)
				fontTags[j].setAttribute("size", 1);
		}
	},
	
	vimScroll: function()
	{
		var currentPost = -1;
		var threadPosts = document.getElementsByClassName("posthead");
		var prevNextElem = document.getElementsByClassName("prev_next");

		var prevElem = prevNextElem[0].childNodes[0];
		var nextElem = prevNextElem[1].childNodes[0];

		var prevPage = prevElem.rel == "prev" ? prevElem.href : window.location;
		var nextPage = nextElem.rel == "next" ? nextElem.href : window.location;

		document.onkeypress = function(evt)
		{
			evt = evt || window.event;
			charCode = evt.keyCode || evt.which;
			charStr = String.fromCharCode(charCode);
			
			if (charStr != "j" && charStr != "k")
				return;

			if (charStr == "j")
				currentPost++;
			if (charStr == "k")
				currentPost--;
			
			if (currentPost < 0)
				window.location = prevPage;
			
			if (currentPost >= threadPosts.length)
				window.location = nextPage;
			
			FPSuite.scrollToElement(threadPosts[currentPost]);
		};
	},
	
	threadDiscover: function()
	{
		var tblLinks = document.getElementsByTagName("a");
		for (var i = 0; i < tblLinks.length; i++)
		{
			var thisLink = tblLinks[i];
			if (thisLink.title)
				continue;
			
			if (!thisLink.href.contains("facepunch.com/showthread"))
				continue;
			
			if (thisLink.parentElement.className.match("nodecontrols"))
				continue;
			
			if (thisLink.parentElement.className.match("information"))
				continue;
			
			thisLink.onmouseover = function()
			{
				var threadLink = this;
				this.onmouseover = function() {};
				
				FPSuite.httpGet(threadLink.href, function(str)
				{
					var threadTitle = str.match("<title>(.*)<\/title>")[1];
					threadLink.title = threadTitle
					threadLink.innerHTML += " -> " + threadTitle;
				});
			}
		}
	},
}

FPSuite.runCode();
window.FPSuite = FPSuite;