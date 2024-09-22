<?php
	$inData = getRequestInfo();
	
	$name = $inData["name"];
	$phone = $inData["phone"];
        $email = $inData["email"];
        $userId = $inData["userId"];
	$datetime = date('Y-m-d H:i:s');

	$conn = new mysqli("localhost", "api", "Team4Yay", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("INSERT INTO Contacts (Name, Phone, Email, UserID, CreatedAt) VALUES(?, ?, ?, ?, ?)");
        	$stmt->bind_param("sssis", $name, $phone, $email, $userId, $createdAt);
        	$stmt->execute();

        	if ($stmt->affected_rows > 0)
        	{
            		// Get the last inserted ID
            		$newId = $conn->insert_id; // Retrieve the newly inserted ID
        	    	returnWithInfo($newId, "Contact added successfully");
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

	function returnWithInfo($id, $message)
    	{
        	$retValue = '{"id":' . $id . ', "message":"' . $message . '", "error":""}';
        	sendResultInfoAsJson($retValue);
    	}

	
?>
