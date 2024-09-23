<?php

    $inData = getRequestInfo();

    $id = $inData["ID"];
    $name = $inData["Name"];
    $phone = $inData["Phone"];
    $email = $inData["Email"];
    
    $conn = new mysqli("localhost", "api", "Team4Yay", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
        $stmt = $conn->prepare("UPDATE Contacts SET Name=?, Phone=?, Email=? WHERE ID=?");
        $stmt->bind_param("sssi", $name, $phone, $email, $id);

        if ($stmt->execute()) {
            returnWithInfo($name, "", $id);
        } else {
            returnWithError("Unable to update contact.");
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
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>