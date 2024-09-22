<?php

    $inData = getRequestInfo();

    $id = $inData["ID"];

    $conn = new mysqli("localhost", "api", "Team4Yay", "COP4331");
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
        	$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=?");
        	$stmt->bind_param("i", $id);
		$stmt->execute();

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

	function returnWithInfo( $message )
	{
		$retValue = '{"message":"' . $message . '", "error":""}';
        	sendResultInfoAsJson( $retValue );
	}

?>
