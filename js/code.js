const urlBase = "http://www.team4project.org/LAMPAPI";
const extension = "php";

let userId = 1;
let firstName = "";
let lastName = "";
let regex = /(?=.*[a-zA-Z])[a-zA-Z0-9-_]{3,18}$/;

/**
 * Creates and sends an XMLHttpRequest object
 *
 * @param { string } url URL string to POST to
 * @param { string } jsonPayload JSON string to send via http
 * @param { string } id HTML id to be edited to the error message
 * @param { function } readyFunc Function to be executed with XMLHTTPRequest.onreadystatechange
 * @return { boolean } Success of request
 */
function xhr(url, jsonPayload, id, readyFunc)
{
	let xhreq = new XMLHttpRequest();
	xhreq.open("POST", url, true);
	xhreq.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhreq.onreadystatechange = readyFunc;
		xhreq.send(jsonPayload);
		return true;
	} catch (err)
	{
		document.getElementById(id).innerHTML = err.message;
		return false;
	}
}

/**
 * Saves cookie in browser for 20 minutes
 */
function saveCookie() {
   let minutes = 20;
   let date = new Date();
   date.setTime(date.getTime() + minutes * 60 * 1000);
   document.cookie =
      "firstName=" +
      firstName +
      ",lastName=" +
      lastName +
      ",userId=" +
      userId +
      ";expires=" +
      date.toGMTString();
}

/**
 * Reads cookie from document and searches for relevant data
 */
function readCookie() {
   userId = -1;
   let data = document.cookie;
   let splits = data.split(",");
   for (var i = 0; i < splits.length; i++) {
      let thisOne = splits[i].trim();
      let tokens = thisOne.split("=");
      if (tokens[0] == "firstName") {
         firstName = tokens[1];
      } else if (tokens[0] == "lastName") {
         lastName = tokens[1];
      } else if (tokens[0] == "userId") {
         userId = parseInt(tokens[1].trim());
      }
   }

   // if( userId < 0 )
   // {
   // 	window.location.href = "index.html";
   // }
   // else
   // {
   // 	document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
   // }
}

//sets id's background color to red & placeholder text to black
function invalidInput(id)
{
	id.style.backgroundColor = "#bc4e43";
	id.classList.add("invalidClass");
	id.value = "";
}

//resets id's background color & placeholder text to orignal values
function resetInput(id)
{
	id.style.backgroundColor = "#f68456";
	id.classList.remove("invalidClass");
	id.value = "";
}

/**
 * Login request to server
 */
function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginUser").value;
	let password = document.getElementById("loginPass").value;
//	var hash = md5( password );
	
	if(!validLogin(login, password)) return;
	
	document.getElementById("loginResult").innerHTML = "";
	
	let tmp = {
		login: login,
		password: password
	};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	xhr(url, jsonPayload, "loginResult", function () {
		console.log(this.readyState + " " + this.status);
		if (this.readyState == 4 && this.status == 200) 
		{
			console.log(this.responseText);
			let jsonObject = JSON.parse(this.responseText);
			userId = jsonObject.id;

			if( userId === undefined ) {
				document.getElementById("loginResult").innerHTML = "Connection could not be resolved. Please try again soon.";
				return false;
			}
	
			if( userId < 1 )
			{		
				document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
				return false;
			}
	
			firstName = jsonObject.firstName;
			lastName = jsonObject.lastName;

         saveCookie();

			window.location.href = "contacts.html";
		}
		else if (this.readyState == 4)
		{
			document.getElementById("loginResult").innerHTML = "Connection could not be resolved. Please try again later.";
		}
	});
	return false;
}

//Switches the displayed form to login from sign up
function goLogin()
{
	var log = document.getElementById("loginForm");
	var sign = document.getElementById("signupForm");
	var lbut = document.getElementById("goLoginButton");
	var sbut = document.getElementById("goSignupButton");
	
	log.style.top = "0px";
	sign.style.top = "400px";
	lbut.style.top = "600px";
	sbut.style.top = "500px";
	
	document.getElementById("loginResult").innerHTML = "";
	resetInput(loginUser);
	resetInput(loginPass);
}

//Checks if the login info is valid
function validLogin(user, pass)
{
	let logRes = "Please input a ";
	let userOk = true;
	let passOk = true;
	
	if(user == "") 
	{
		console.log("Username is blank");
		logRes += "username";
		invalidInput(loginUser);
		userOk = false;
	}
	else 
	{
		if(regex.test(user) == false)
		{
			console.log("Username is invalid");
			logRes += "username";
			invalidInput(loginUser);
			userOk = false;
		}
		
		console.log("Username is valid");
	}
	
	if(pass == "") 
	{
		if(!userOk) logRes += " and <br/>";
		console.log("Password is blank");
		logRes += "password";
		invalidInput(loginPass);
		passOk = false;
	}
	else
	{
		if(regex.test(pass) == false)
		{
			if(!userOk) logRes += " and <br/>";
			console.log("Password is invalid");
			logRes += "valid password";
			invalidInput(loginPass);
			passOk = false;
		}
		
		console.log("Password is valid");
	}
	
	if(!userOk || !passOk) 
	{
		logRes += " to login";
		document.getElementById("loginResult").innerHTML = logRes;
		return false;
	}
	
	return true;
}

/**
 * Sign up new user to server
 */
function doSignup()
{
	firstName = document.getElementById("signupFName").value;
	lastName = document.getElementById("signupLName").value;
	let login = document.getElementById("signupUser").value;
	let password = document.getElementById("signupPass").value;
//	var hash = md5( password );
	
	if(!validSignup(firstName, lastName, login, password)) return;
	
	document.getElementById("signupResult").innerHTML = "";
	
	let tmp = {
		firstName: firstName,
		lastName: lastName,
		login: login,
		password: password
	};
	
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Signup.' + extension;
	
	xhr(url, jsonPayload, "signupResult", function() {
		if(this.status == 409)
		{
			document.getElementById("signupResult").innerHTML = "User already exists";
			console.log("Sign up failed since user already exists");
			alert("This user already exists please login");
			return;
		}
		
		if (this.readyState == 4 && this.status == 200) 
		{
			let jsonObject = JSON.parse(this.responseText);
			userId = jsonObject.id;
			firstName = jsonObject.firstName;
			lastName = jsonObject.lastName;
			
			document.getElementById("signupResult").innerHTML = "User added";
			
			saveCookie();

         window.location.href = "contacts.html";
      }
   });
}

//Switches the displayed form to sign up from login
function goSignup()
{
	var log = document.getElementById("loginForm");
	var sign = document.getElementById("signupForm");
	var lbut = document.getElementById("goLoginButton");
	var sbut = document.getElementById("goSignupButton");
	
	log.style.top = "-400px";
	sign.style.top = "-218px";
	lbut.style.top = "500px";
	sbut.style.top = "600px";
	
	document.getElementById("signupResult").innerHTML = "";
	resetInput(signupFName);
	resetInput(signupLName);
	resetInput(signupUser);
	resetInput(signupPass);
}

//Checks if the sign up info is valid
function validSignup(fname, lname, user, pass)
{
	let signResN = "Please input a ";
	let signResC = "Please input a ";
	let fnameOk = true;
	let lnameOk = true;
	let userOk = true;
	let passOk = true;
	
	if(fname === "") 
	{
		console.log("First name is blank");
		signResN += "first name";
		invalidInput(signupFName);
		fnameOk = false;
	}
	else 
	{
		if(regex.test(fname) === false)
		{
			console.log("First name is invalid");
			signResN += "valid first name";
			invalidInput(signupFName);
			fnameOk = false;
		}
		
		console.log("First name is valid");
	}
	
	if(lname == "") 
	{
		if(!fnameOk) signResN += " and <br/>";
		console.log("Last name is blank");
		signResN += "last name";
		invalidInput(signupLName);
		lnameOk = false;
	}
	else
	{
		if(regex.test(lname) === false)
		{
			if(!fnameOk) signResN += " and <br/>";
			console.log("Last name is invalid");
			signResN += "valid last name";
			invalidInput(signupLName);
			lnameOk = false;
		}
		
		console.log("Last name is valid");
	}
	
	signResN += " to sign up";
	
	if(user === "") 
	{
		console.log("Username is blank");
		signResC += "username";
		invalidInput(signupUser);
		userOk = false;
	}
	else 
	{
		if(regex.test(user) === false)
		{
			console.log("Username is invalid");
			signResC += "valid username";
			invalidInput(signupUser);
			userOk = false;
		}
		
		console.log("Username is valid");
	}
	
	if(pass === "") 
	{
		if(!userOk) signResC += " and <br/>";
		console.log("Password is blank");
		signResC += "password";
		invalidInput(signupPass);
		passOk = false;
	}
	else
	{
		if(regex.test(pass) === false)
		{
			if(!userOk) signResC += " and <br/>";
			console.log("Password is invalid");
			signResC += "valid password";
			invalidInput(signupPass);
			passOk = false;
		}
		
		console.log("Password is valid");
	}
	
	signResC += " to sign up";
	
	if(!fnameOk || !lnameOk)
	{
		if(!userOk || !passOk)
		{
			document.getElementById("signupResult").innerHTML = signResN + "<br/>" + signResC;
			return false;
		}
		document.getElementById("signupResult").innerHTML = signResN;
		return false;
	}
	
	if(!userOk || !passOk)
	{
		document.getElementById("signupResult").innerHTML = signResC;
		return false;
	}
	
	return true;
}

/**
 * Ends session and expires all cookies
 */
function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

/**
 * Adds contact to user's contact list
 */
function toggleNewContactBox() {
	const newContactBox = document.getElementById("newContactBox");
	newContactBox.style.display = newContactBox.style.display === "none" ? "block" : "none";
}

function addContact() {
	let contactName = document.getElementById("newContactName").value;
	let contactEmail = document.getElementById("newContactEmail").value;
	let contactPhone = document.getElementById("newContactPhone").value;

	if (!contactName || !contactEmail || !contactPhone) {
		 alert("Please fill in all fields");
		 return;
	}

	let tmp = {
		 name: contactName,
		 email: contactEmail,
		 phone: contactPhone,
		 userId: userId,
	};

	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + "/Add." + extension;

	xhr(url, jsonPayload, "", function () {
		 if (this.readyState == 4 && this.status == 200) {
			  let jsonObject = JSON.parse(this.responseText);
			  if (jsonObject.error === "") {
					// Clear input fields
					document.getElementById("newContactName").value = "";
					document.getElementById("newContactEmail").value = "";
					document.getElementById("newContactPhone").value = "";

					// Hide the new contact box
					document.getElementById("newContactBox").style.display = "none";

					// Refresh the contact list
					searchContacts();
			  } else {
					alert(jsonObject.error);
			  }
		 }
	});
}

/**
 * Fetches contact from user's contact list
 */
function searchContacts() {
   let srch = document.getElementById("searchBar").value;

   let contactList = "";
   readCookie();

   let tmp = {
      search: srch,
      userId: userId,
   };

   let jsonPayload = JSON.stringify(tmp);

   let url = urlBase + "/Search." + extension;

   xhr(url, jsonPayload, "", function () {
      if (this.readyState == 4 && this.status == 200) {
         let jsonObject = JSON.parse(this.responseText);

         document.getElementById("contactList").innerHTML = "";

         for (let i = 0; i < jsonObject.results.length; i++) {
            let contact = jsonObject.results[i];

            let contactHtml = `
               <div class="contact-row collapsed" id="contact-${contact.ID}">
                  <div class="contact-header">
                     <span class="contact-name editable" id="name-${contact.ID}">${contact.Name}</span>
                     <span class="toggle-indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                           <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                     </span>
                  </div>
                  <div class="contact">
                     <div class="contact-info">
                        <div id="emailDiv">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                           </svg>       
                           <div id="email-${contact.ID}" class="editable">${contact.Email}</div>                     
                        </div>
                        <div id="phoneDiv">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-6">
                              <path d="M8 16.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" />
                              <path fill-rule="evenodd" d="M4 4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4Zm4-1.5v.75c0 .414.336.75.75.75h2.5a.75.75 0 0 0 .75-.75V2.5h1A1.5 1.5 0 0 1 14.5 4v12a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 16V4A1.5 1.5 0 0 1 7 2.5h1Z" clip-rule="evenodd" />
                           </svg>    
                           <div id="phone-${contact.ID}" class="editable">${contact.Phone}</div>                          
                        </div>
                     </div>
                     <div class="contact-bottom">
                        <div id="dateCreated">${contact.CreatedAt}</div>
                        <div class="contact-actions">
                           <button class="contactButtons edit-btn" onclick="editContact(${contact.ID})">Edit</button>
                           <button class="contactButtons save-btn" style="display:none;" onclick="saveContact(${contact.ID})">Save</button>
                           <button class="contactButtons delete-btn" onclick="deleteContact(${contact.ID})">Delete</button>
                        </div>
                     </div>
                  </div>
               </div>
            `;

            document.getElementById("contactList").insertAdjacentHTML("beforeend", contactHtml);
         }
      }
   });
}

/**
 * Deletes contact from user's contact list
 */
function deleteContact(id) {
   if (!confirm("Are you sure you want to delete this contact?")) return;

   let tmp = {
      ID: id,
      userId: userId,
   };
   let jsonPayload = JSON.stringify(tmp);

   let url = urlBase + "/Delete." + extension;

   xhr(url, jsonPayload, "", function () {
      if (this.readyState == 4 && this.status == 200) {
			searchContacts();
      }
   });

}

/**
 * Edits contact from user's contact list
 */
function editContact(id) {
   const contactRow = document.getElementById(`contact-${id}`);
   const editableFields = contactRow.querySelectorAll('.editable');
   const editBtn = contactRow.querySelector('.edit-btn');
   const saveBtn = contactRow.querySelector('.save-btn');

   editableFields.forEach(field => {
      field.contentEditable = true;
      field.classList.add('editing');
   });

   editBtn.style.display = 'none';
   saveBtn.style.display = 'inline-block';
}

// Modify the saveContact function:
function saveContact(id) {
   const contactRow = document.getElementById(`contact-${id}`);
   const editableFields = contactRow.querySelectorAll('.editable');
   const editBtn = contactRow.querySelector('.edit-btn');
   const saveBtn = contactRow.querySelector('.save-btn');

   const newName = document.getElementById(`name-${id}`).textContent;
   const newEmail = document.getElementById(`email-${id}`).textContent;
   const newPhone = document.getElementById(`phone-${id}`).textContent;

   let tmp = {
      ID: id,              // Ensure the key names match the PHP code
      Name: newName,
      Email: newEmail,
      Phone: newPhone,
   };

   let jsonPayload = JSON.stringify(tmp);

   let url = urlBase + "/Edit." + extension;

   xhr(url, jsonPayload, "", function () {
      if (this.readyState == 4 && this.status == 200) {
         let response = JSON.parse(this.responseText);
         if (response.error === "") {
            editableFields.forEach(field => {
               field.contentEditable = false;
               field.classList.remove('editing');
            });

            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';

            // You can add a success message here if needed
         } else {
            alert("Error updating contact: " + response.error);
         }
      }
   });
}

document.addEventListener("DOMContentLoaded", function () {
   searchContacts();
   const contactList = document.getElementById("contactList");

   contactList.addEventListener("click", function (event) {
      const contactRow = event.target.closest(".contact-row");
      if (contactRow) {
         // Check if the click is on the header or toggle indicator
         if (event.target.closest(".contact-header, .toggle-indicator")) {
            toggleContact(contactRow);
         }
         // Prevent toggling when clicking on editable fields or buttons
         if (event.target.closest(".editable, .contactButtons")) {
            event.stopPropagation();
         }
      }
   });

   function toggleContact(row) {
      row.classList.toggle("expanded");
      row.classList.toggle("collapsed");
      const toggleIndicator = row.querySelector(".toggle-indicator");
      toggleIndicator.innerHTML = row.classList.contains("expanded")
         ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
               <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>`
         : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
               <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>`;
   }

   let scrollToTopBtn = document.getElementById("scrollToTopBtn");

   // Show the button when scrolling down 20px from the top
   window.onscroll = function () {
      if (
         document.body.scrollTop > 20 ||
         document.documentElement.scrollTop > 20
      ) {
         scrollToTopBtn.style.display = "block";
      } else {
         scrollToTopBtn.style.display = "none";
      }
   };

   // Scroll to the top of the document
   scrollToTopBtn.onclick = function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
   };
});
