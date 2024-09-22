const urlBase = 'http://www.team4project.org/LAMPAPI';
const extension = 'php';

let userId = 0;
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
function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

/**
 * Reads cookie from document and searches for relevant data
 */
function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
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
function addContact()
{
	let newContact = document.getElementById("contactText").value;
	document.getElementById("contactAddResult").innerHTML = "";

	let tmp = {
		contact: newContact,
		userId: userId
	};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/Add.' + extension;

	xhr(url, jsonPayload, "contactAddResult", function() {
		if (this.readyState == 4 && this.status == 200) 
		{
			document.getElementById("contactAddResult").innerHTML = "Contact has been added";
		}
	});
}

/**
 * Fetches contact from user's contact list
 */
function searchContacts()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("contactSearchResult").innerHTML = "";
	
	let contactList = "";

	let tmp = {
		search: srch,
		userId: userId
	};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Search.' + extension;

	xhr(url, jsonPayload, "contactSearchResult", function() {
		if (this.readyState == 4 && this.status == 200) 
		{
			document.getElementById("contactSearchResult").innerHTML = "Contact(s) has been retrieved";
			let jsonObject = JSON.parse(this.responseText);
			
			for( let i=0; i<jsonObject.results.length; i++ )
			{
				contactList += jsonObject.results[i];
				if( i < jsonObject.results.length - 1 )
				{
					contactList += "<br />\r\n";
				}
			}
			
			document.getElementsByTagName("p")[0].innerHTML = contactList;
		}
	});
}

/**
 * Deletes contact from user's contact list
 */
function deleteContact()
{
	if(!(confirm("Are you sure you want to delete this contact?"))) return;
	
	let delContact = document.getElementById("contactText").value;
	document.getElementById("contactDeleteResult").innerHTML = "";
	
	let tmp = {
		contact: delContact,
		userId: userId
	};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Delete.' + extension;

	xhr(url, jsonPayload, "contactDeleteResult", function() {
		if (this.readyState == 4 && this.status == 200) 
		{
			document.getElementById("contactDeleteResult").innerHTML = "Contact has been deleted";
		}
	});
}

/**
 * Edits contact from user's contact list
 */
function editContact()
{
	let newContact = document.getElementById("newContactText").value;
	document.getElementById("contactEditResult").innerHTML = "";

	let tmp = {
		contact: newContact,
		userId: userId
	};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/Edit.' + extension;

	xhr(url, jsonPayload, "contactEditResult", function() {
		if (this.readyState == 4 && this.status == 200)
		{
			document.getElementById("contactEditResult").innerHTML = "Contact has been edited";
		}
	});
}