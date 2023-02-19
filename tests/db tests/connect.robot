*** Settings ***
Documentation     		Connecting to the DB
Resource				./resources/vm.resource
Resource				./resources/db.resource
Test Setup				Set Log Level		TRACE


*** Test Cases ***	
Initialize Connection
	[tags]				Connection	UpdateDB	Tables	Procedures
    Connect to VM
	Log 				\n\nConnection to VM established!		console=yes
	Connect to DB
	Log					\nConnection to DB established!			console=yes
	
Update and re-run DB
	[tags]				UpdateDB
	Update DB file
	Log					\ndb.sql updated!			console=yes
	Run DB file
	Log					\ndb.sql executed!			console=yes
	
Tables
	[tags]				Tables	Procedures
	Check If All Tables Exist
	
Procedures
	[tags]				Procedures
	Call Each Procedure
	
Disconnect
	[tags]				Connection	UpdateDB	Tables	Procedures
	Disconnect from VM