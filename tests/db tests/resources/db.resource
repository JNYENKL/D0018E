*** Settings ***
Documentation     		Custom keywords for DB tests
Library           		DatabaseLibrary 
Library					OperatingSystem

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

# Procedures and their parameters
${addUser}			d0018e_store.add_user 
${addUser_admin}	'admin', 'admin', 'admin@d0018e.com', 'password'
${user1_mail}		adam@ad.am
${user2_mail}		bertil@ber.til
${user3_mail}		calle@cal.le
${user4_mail}		daniel@dani.el
${user5_mail}		elias@eli.as
${user6_mail}		fredrik@fred.rik
${addUser_p1}		'adam', 'adamsson', '${user1_mail}', 'addie'
${addUser_p2}		'bertil', 'bertilsson', '${user2_mail}', 'berrie'
${addUser_p3}		'calle', 'callesson', '${user3_mail}', 'callie'
${addUser_p4}		'daniel', 'danielsson', '${user4_mail}', 'dannie'
${addUser_p5}		'elias', 'eliasson', '${user5_mail}', 'ellie'
${addUser_p6}		'fredrik', 'fredriksson', '${user6_mail}', 'freddie'
${bU_mail}			basket@bask.et
${addUser_bU}		'basket', 'basketsson', '${bU_mail}', 'baskie'
${addToBasket}		d0018e_store.add_item_to_shopping_basket
${newOrder}			d0018e_store.create_order 
${newAss}			d0018e_store.add_order_asset

# Asset specific stuff
${toInsertAss}		subject_id,title,price,amount,description
${newBook1_tit}		Digital Stuff
${newBook2_tit}		Introduction To Life
${newBook3_tit}		Nightmares For Babies
${newBook_pic_path}	./../../views/img/
${newBook1_pic}		85.png
${newBook2_pic}		86.png
${newBook3_pic}		87.png
${newBook1}			2,"${newBook1_tit}",160.89,24,"Diggy wiggy biggy piggy"
${newBook2}			2,"${newBook2_tit}",299,20,"The most valueable book in the world. It will change your life. Trust us."
${newBook3}			3,"${newBook3_tit}",199,14,"Ever heard of lullabies for babies? Here comes the LTU version of it. Nightmares. We guarantee you not only immediate nightmares but also long term PTSD."


*** Keywords ***	
	
Connect to DB
	Connect To Database		pymysql	${DBName}	${DBUser}	${DBPassword}	${DBHost}	${DBPort}
	
Update DB file
	Put File				${dbsql-path}
	File Should Exist		${dbsql-file}
	
Run DB file
	${rc}					Execute Command			mysql < db.sql		return_rc=true		sudo=true
	Should Be Equal As Integers			${rc[1]}		0
		
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
	
Check Admin
	Table Must Exist		${user}
	${user_id_mail} =		Check If Exists In Database			select user_id from user where email = 'admin@d0018e.com'
	${user_id_pw} =			Check If Exists In Database			select user_id from user where password = 'password'
	Should Be Equal			${user_id_mail}						${user_id_pw}
	
#Delete All Users

Add User Cant Remove User Add
	Execute Sql String		CALL ${addUser}(${addUser_bU});
	
Add User Cant Remove User Cant Remove
	${fail} = 		Run Keyword And Return Status			Execute Sql String		DELETE FROM ${user} WHERE email='${bU_mail}';
	Should Be Equal As Strings		${fail}			False

	
Add Six Users
	${user_counter_bef}=	Row Count							select * from user
	Execute Sql String		CALL ${addUser}(${addUser_p1});
	Execute Sql String		CALL ${addUser}(${addUser_p2});
	Execute Sql String		CALL ${addUser}(${addUser_p3});
	Execute Sql String		CALL ${addUser}(${addUser_p4});
	Execute Sql String		CALL ${addUser}(${addUser_p5});
	Execute Sql String		CALL ${addUser}(${addUser_p6});
	${user_counter_aft}=	Set Variable						${user_counter_bef} + 6
	Row Count Is Equal To X	select * from user					${user_counter_aft}
	
Add Three Books
	Table Must Exist		${asset}
	${book_counter_bef}=	Row Count							select * from ${asset}
	Execute Sql String 		insert into ${asset}(${toInsertAss}) values(${newBook1}),(${newBook2}),(${newBook3});
	${book_counter_expect}=	Evaluate							${book_counter_bef} + 3
	${book_counter_after}=	Row Count	select * from ${asset}					
	Should Be Equal As Integers		${book_counter_expect}		${book_counter_after}
	
Add Pics To Books
	Table Must Exist		${asset}
	${book1_ass_id}=		Query		select asset_id from ${asset} where title="${newBook1_tit}"
	OperatingSystem.File Should Exist		${newBook_pic_path}${newBook1_pic}
	Move File				${newBook_pic_path}${newBook1_pic}		${newBook_pic_path}${book1_ass_id[0][0]}.png
	${book2_ass_id}=		Query		select asset_id from ${asset} where title="${newBook2_tit}"
	OperatingSystem.File Should Exist		${newBook_pic_path}${newBook2_pic}
	Move File				${newBook_pic_path}${newBook2_pic}		${newBook_pic_path}${book2_ass_id[0][0]}.png
	${book3_ass_id}=		Query		select asset_id from ${asset} where title="${newBook3_tit}"
	OperatingSystem.File Should Exist		${newBook_pic_path}${newBook3_pic}
	Move File				${newBook_pic_path}${newBook3_pic}		${newBook_pic_path}${book3_ass_id[0][0]}.png
	
Delete Three Books
	Table Must Exist		${asset}
	${ass_count_bef}=		Row Count							select * from ${asset}
	Execute Sql String		delete from ${asset} where title="${newBook1_tit}" or title="${newBook2_tit}" or title="${newBook3_tit}";
	${ass_count_expect}=	Evaluate							${ass_count_bef} - 3
	${ass_count_aft}=		Row Count							select * from ${asset}
	Should Be Equal As Integers		${ass_count_expect}			${ass_count_aft}
	
	
	