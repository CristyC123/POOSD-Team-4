<?php
	$inData = getRequestInfo();
	
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$login = $inData["login"];
	$password = $inData["password"];
	
	$userId = $inData["userId"];

	$conn = new mysqli("localhost", "api", "Team4Yay", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("INSERT into Users (firstName,lastName,login,password) VALUES(?,?,?,?)");
		if( $row = $result->fetch_assoc()  )
		{
			returnWithError("Dupicate User Signup Attempt");
		} 
		else 
		{
			$stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
			$stmt->execute();
		}

		$stmt->close();
		$conn->close();
		

	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
	
?>