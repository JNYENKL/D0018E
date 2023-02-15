*** Settings ***
Documentation     		Connecting to the DB
Resource				./resources/db.resource
Test Setup				Set Log Level		TRACE


*** Test Cases ***	
Initialize Connection
    Connect to VM
	Log 				\n\nConnection to VM established!		console=yes
	Connect to DB
	Log					\nConnection to DB established!			console=yes
	
#Update and re-run DB
#	Update DB file
#	Log					\ndb.sql updated!			console=yes
#	Run DB file
#	Log					\ndb.sql executed!			console=yes
	
Disconnect
	Disconnect from VM