*** Settings ***
Documentation     		Custom keywords for DB tests
Library           		DatabaseLibrary 

*** Variables ***
${dbsql-file}	db.sql
${dbsql-path}	./../../db/${dbsql-file}

# DB Credentials, move to cfg file
${DBName}  		d0018e_store
${DBUser}  		root
${DBPassword}  
${DBHost}  		127.0.0.1
${DBPort}  		33306

# Tables in DB
${user}			user
${basket}		shopping_basket
${order}		order
${subject}		subject
${asset}		asset
${orderAss}		order_asset
${basketAss}	shopping_basket_asset
${comment}		comment

#Procedures and their parameters
${addUser}		d0018e_store.add_user 
${addUser_p}	'adam', 'adamsson', 'adam@ad.am', 'f7f376a1fcd0d0e11a10ed1b6577c99784d3a6bbe669b1d13fae43eb64634f6e'
${addToBasket}	d0018e_store.add_item_to_shopping_basket
${newOrder}		d0018e_store.create_order 
${newAss}		d0018e_store.add_order_asset 


*** Keywords ***	
	
Connect to DB
	Connect To Database		pymysql	${DBName}	${DBUser}	${DBPassword}	${DBHost}	${DBPort}
	
Update DB file
	Put File				${dbsql-path}
	File Should Exist		${dbsql-file}
	
Run DB file
	Execute Command			mysql < db.sql		sudo=true
		
Check If All Tables Exist
	Table Must Exist		${user}
	Table Must Exist		${basket}
	Table Must Exist		${order}
	Table Must Exist		${subject}
	Table Must Exist		${asset}
	Table Must Exist		${orderAss}
	Table Must Exist		${basketAss}
	Table Must Exist		${comment}
	
Call Each Procedure	
	Execute Sql String		CALL ${addUser}(${addUser_p});