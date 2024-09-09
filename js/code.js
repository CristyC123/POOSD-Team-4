const urlBase = 'http://team4project.org/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

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
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

/**
 * Login request to server
 */
function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("Username").value;
	let password = document.getElementById("Password").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	xhr(url, jsonPayload, "loginResult", () => {
		if (this.readyState == 4 && this.status == 200) 
		{
			let jsonObject = JSON.parse( xhr.responseText );
			userId = jsonObject.id;
	
			if( userId < 1 )
			{		
				document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
				return;
			}
	
			firstName = jsonObject.firstName;
			lastName = jsonObject.lastName;

			saveCookie();

			window.location.href = "contacts.html";
		}
	});
}
/**
 * Sign up new user to server
 */
function doSignUp()
{
	firstName = document.getElementById("First Name").value;
	lastName = document.getElementById("Last Name").value;
	let login = document.getElementById("Username").value;
	let password = document.getElementById("Password").value;
//	var hash = md5( password );
	
	document.getElementById("singupResult").innerHTML = "";
	
	let tmp = {firstName:lastName,login:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Signup.' + extension;
	
	xhr(url, jsonPayload, "signupResult", () => {
		if (this.readyState == 4 && this.status == 200) 
		{
			let jsonObject = JSON.parse( xhr.responseText );
			
			firstName = jsonObject.firstName;
			lastName = jsonObject.lastName;
			
			saveCookie();

			window.location.href = "contacts.html";
		}
	});
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

	let tmp = {contact:newContact,userId,userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/Add.' + extension;

	xhr(url, jsonPayload, "contactAddResult", () => {
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

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/Search.' + extension;

	xhr(url, jsonPayload, "contactSearchResult", () => {
		if (this.readyState == 4 && this.status == 200) 
		{
			document.getElementById("contactSearchResult").innerHTML = "Contact(s) has been retrieved";
			let jsonObject = JSON.parse( xhr.responseText );
			
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
	let delContact = document.getElementById("contactText").value;
	document.getElementById("contactDeleteResult").innerHTML = "";
	
	let tmp = {contact:delContact,userId,userId};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Delete.' + extension;

	xhr(url, jsonPayload, "contactDeleteResult", () => {
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

	let tmp = {contact:newContact,userId,userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/Edit.' + extension;

	xhr(url, jsonPayload, "contactEditResult", () => {
		if (this.readyState == 4 && this.status == 200)
		{
			document.getElementById("contactEditResult").innerHTML = "Contact has been edited";
		}
	});
}

function goLogin()
{
	var log = document.getElementById("loginForm");
	var sign = document.getElementById("signupForm");
	var lbut = document.getElementById("goLoginButton");
	var sbut = document.getElementById("goSignupButton");
	
	log.style.top = "0px";
	sign.style.top = "400px";
	lbut.style.top = "500px";
	sbut.style.top = "400px";
}

function goSignup()
{
	var log = document.getElementById("loginForm");
	var sign = document.getElementById("signupForm");
	var lbut = document.getElementById("goLoginButton");
	var sbut = document.getElementById("goSignupButton");
	
	log.style.top = "-400px";
	sign.style.top = "-125px";
	lbut.style.top = "400px";
	sbut.style.top = "500px";
}
