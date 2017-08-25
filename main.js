function checkURL(urlString) {
  var string = urlString.value;
  if (!~string.indexOf("http")) { // works for both http and https protocol
    string = "http://" + string;
  }
  urlString.value = string;
  return urlString
}

function requestRawSource() {
  // Where we will display the highlightable raw source
  var displayArea = document.getElementById("raw-source");
  displayArea.innerHTML = '';
  // Check if URL entered is valid
  var validatedUrl = validateUserInput(document.getElementById("web-page"));
  // Remove the click listener from the previous HTML text displayed
  displayArea.removeEventListener("click", highlightTags);

  if (validatedUrl) {
    var request = new XMLHttpRequest();
    request.open("get", "/api/requestSource?url=" + validatedUrl, true);
    request.onload = function () {
      var status = request.status;
      if (status === 200) {
        // Display the response HTML, having each tag wrapped in a highlightable div
        displayArea.append(setHighlightCss(request.responseText));
        // Listen for clicks on the tags
        displayArea.addEventListener("click", highlightTags);
        // Apply a border, font, and cursor
        displayArea.setAttribute("style", "border: 1px solid black; font-family: courier; cursor: pointer")
      } else {
        alert(request.status + "\n" + validatedUrl);
      }
    };
    request.send();
  }
}

function validateUserInput(userInput) {
  if (!userInput.value || userInput.value === "") {
    alert("Please enter a valid URL");
    userInput.focus();
    return;
  }
  return userInput.value;
}

function setHighlightCss(rawSource) {
  var container = document.createElement("div");
  // Converts the raw source text we recieved back to HTML
  container.innerHTML = rawSource;
  // The parent div to which we will append all the tags
  var parent = document.createElement("div");
  // Recursively parse the DOM and apply the CSS rules we need
  return parseDom(container, parent);
}

function parseDom(start, parent) {
  var nodes;
  // If the starting node has child nodes
  if (start.childNodes) {
    nodes = start.childNodes;
    // Iterate through the children applying the CSS rules as well
    interateChildren(nodes, parent);
  }
  return parent;
}

function interateChildren(nodes, parent) {
  var node;
  for (var i = 0; i < nodes.length; i++) {
    node = nodes[i];
    // Append each node to the parent we created
    appendNode(node, parent);
    // If the current node has nested nodes
    if (node.childNodes) {
      // Apply the same CSS rules to the nested nodes before moving on
      parseDom(node, parent);
      // Finally, append the closing tag of our node
      appendClosingTag(node, parent)
    }
  }
  return parent;
}

function appendNode(node, parent) {
  var whitespace = /^\s+$/g;
  // If the node is a HTML element
  if (node.nodeType === 1) {
    var tagName = node.tagName.toLowerCase();
    var child = document.createElement("div");
    child.setAttribute("class", "highlight-" + tagName);
    // If there are more elements to iterate over
    if (node.innerHTML) {
      // Only wrap the opening tag in the "highlightable" CSS class
      child.innerText += node.outerHTML.split(">")[0] + ">";
      parent.appendChild(child);
      // If no more elements to iterate over
    } else {
      // Wrap the entire HTML block in the "highlightable" CSS class
      child.innerText += node.outerHTML;
      parent.appendChild(child);
    }
    // If the node is text
  } else if (node.nodeType === 3) {
    // Remove whitespace from the text
    node.data = node.data.replace(whitespace, "");
    // If node has text after whitespace removal
    if (node.data) {
      // Wrap it in div without the "highlightable" CSS class
      var child = document.createElement("div");
      child.innerText += node.data;
      parent.appendChild(child);
    }
  }
  return parent;
}

function appendClosingTag(node, parent) {
  // If the element has a closing tag
  if (node.outerHTML && node.outerHTML.indexOf("</") !== -1) {
    // Wrap it in div without the "highlightable" CSS class
    var child = document.createElement("div");
    child.setAttribute("class", "highlight-" + node.tagName.toLowerCase());
    // Add the closing tag
    child.innerText += "</" + node.outerHTML.split("</").pop();
    // Append to the parent div
    parent.appendChild(child);
  }
}

function highlightTags(e) {
  if (e.target) {
    var className = e.target.className;
    // Only highlight the elements with "highlightable" CSS class
    if (className.includes("highlight-")) {
      // Remove highlight from tag previously clicked on
      if (this.hasAttribute("highlighted-class")) {
        setBackgroundColor(this.getAttribute("highlighted-class"), "#FFFFFF");
      }
      // Keep track of the currently highlighted CSS class
      this.setAttribute("highlighted-class", e.target.className);
      // Highlight all elements with matching CSS class
      setBackgroundColor(className, "#FFFBCC")
    }
  }
}

function setBackgroundColor(className, color) {
  var elements = document.getElementsByClassName(className);
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = color;
  }
}
