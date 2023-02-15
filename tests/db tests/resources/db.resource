*** Settings ***
Documentation     		Custom keywords for DB tests
Library           		DatabaseLibrary 
Library           		SSHLibrary
Library					Dialogs


*** Variables ***
${dbsql-file}	db.sql
${dbsql-path}	./../../db/${dbsql-file}

# DB Credentials, move to cfg file
${DBName}  d0018e_store
${DBUser}  root
${DBPassword}  
${DBHost}  127.0.0.1
${DBPort}  33306

# SSH credentials, move to cfg file
${SSHHost}	130.240.207.20
${SSHPort}	26880
${SSHUser}	karruc-9
${localPort}	33306
${remotePort}	3306 

# Tables in DB
${user}		user
${basket}	shopping_basket


*** Keywords ***	
Connect to VM
	Set Log Level    		NONE
	${SSHPassword} =		Get Value From User				SSH password:		hidden=yes
    Open Connection			${SSHHost}		port=${SSHPort}
	Login					${SSHUser}		${SSHPassword}
	Set Log Level    		TRACE
	Create Local Ssh Tunnel	${localPort}	${DBHost}		${remotePort}
	
Connect to DB
	Connect To Database		pymysql	${DBName}	${DBUser}	${DBPassword}	${DBHost}	${DBPort}
	
Update DB file
	Put File				${dbsql-path}
	File Should Exist		${dbsql-file}
	
Run DB file
	Execute Command			mysql < db.sql		sudo=true
	
Disconnect from VM
	Close All Connections