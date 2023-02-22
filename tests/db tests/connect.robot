*** Settings ***
Documentation     		Connecting to the DB
Resource				./resources/vm.resource
Resource				./resources/db.resource
Test Setup				Set Log Level		TRACE


*** Test Cases ***	
Initialize Connection
	[tags]				Connection	UpdateDB	Tables	Procedures	Admin	Addusers	UserBasketRefusal	AddBooks	DeleteBooks
	Disconnect from VM
	Disconnect from VM
	Disconnect from VM
	Disconnect from VM
	Disconnect from VM
	Disconnect from VM
	Disconnect from VM
	Disconnect from VM
	Disconnect from VM
	Disconnect from VM
	Disconnect from VM
	Disconnect from VM
	Disconnect from VM
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
	
Admin@d0018e.com With Password 'password' exists
	[tags]				Admin
	Check Admin
	
Six More Users
	[tags]				Addusers
	Add Six Users
	
Three More Books
	[tags]				AddBooks
	Add Three Books
	Add Pics To Books
	
Three Less Books
	[tags]				DeleteBooks
	Delete Three Books
		
Refuse To Delete User Due To Auto Basket
	[tags]				UserBasketRefusal
	Add User Cant Remove User Cant Remove
	
Tables
	[tags]				Tables	Procedures
	Check If All Tables Exist
	
Procedures
	[tags]				Procedures
	Call Each Procedure
	
Disconnect
	[tags]				Connection	UpdateDB	Tables	Procedures	Admin
	Disconnect from VM