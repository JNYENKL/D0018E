*** Settings ***
Documentation     		Connect in order to run and test the website
Resource				./resources/gui.resource
Resource				./resources/users.resource
Test Setup				Set Log Level		TRACE

*** Variables ***


*** Test Cases ***
Initialize Connection
	[tags]				GUIConnection
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
	
Run Website
	[tags]				GUIConnection
	#Run App
	Start Website

Create User A
    [Tags]               TC1, createUser, userA
    Create User "${userA_fname}" "${userA_lname}" "${userA_email}" "${userA_pw}"

#Create User B With No First Name
#    [Tags]               TC2, createUserFail
#    Run Keyword And Expect Error    *        Create User "" "${userB_lname}" "${userB_email}" "${userB_pw}"

#Create User B With Too Long Last Name
#    [Tags]               TC3, createUserFail
#    Run Keyword And Expect Error    *        Create User "${userB_fname}" "${userB_lname_long}" "${userB_email}" "${userB_pw}"

#Create User B With Existing Email
#    [Tags]               TC4, createUserFail
#    Run Keyword And Expect Error    *        Create User "${userB_fname}" "${userB_email}" "${userA_email}" "${userB_pw}"

Create User B
    [Tags]               TC5, createUser, userB
    Create User "${userB_fname}" "${userB_lname}" "${userB_email}" "${userB_pw}"

Login User A
    [Tags]               TC6, login, userA
    Login User "${userA_email}" "${userA_pw}"

Logout User A
    [Tags]               TC7, logout, userA
    Logout User
    
#Login User B With Wrong Password
#    [Tags]               TC8, loginFail, userB
#    Run Keyword And Expect Error    *        Login User "${userB_email}" "${userA_pw}"

#Login User B With Wrong Email
#    [Tags]               TC9, loginFail, userB
#    Run Keyword And Expect Error    *        Login User "${userB_email_wrong}" "${userB_pw}"

Login User B
    [Tags]               TC10, login, userB
    Login User "${userB_email}" "${userB_pw}"

Logout User B
    [Tags]               TC11, logout, userB
    Logout User

Add Algorithm Book To Basket
    [tags]               TC12, addToBasket, userA
    Add To Basket And Login "${userA_email}" "${userA_pw}"

Logout User A Again
    Logout User

Login User B Again
    Login User "${userB_email}" "${userB_pw}"

User B Has Empty Basket
    [tags]                TC13, emptyBasket, userB
    Check For Empty Basket

Logout User B Yet Again
    Logout User

Login User A Yet Again
    Login User "${userA_email}" "${userA_pw}"

User A Still Has Algorithm Book In Basket
    [tags]                TC14, basketCheck, userA
    Book In Basket "${algo_book}"
    Amount In Basket "${1}"

Add Same Book Twice
    [tags]                TC15, basketChange, userA
    Increment Book "${algo_book}"

Remove Same Book Once
    [tags]                TC16, basketChange, userA
    Minus One Book "${algo_book}"

Visit The Book Page
    [tags]                TC17, linkCheck, userA
    Navigate To Product Page And Back

Place Order
    [tags]                TC18, placeOrder, orderHistory, userA
    Confirm Order
    Check Order History And Expect One

Once Again Logout User A
    Logout User

Once Again Login User B
    Login User "${userB_email}" "${userB_pw}"

Make Sure User B Has No Order History
    [tags]                TC19, orderHistory, userB
    Check Order History And Expect Zero

Once Again Logout User B
    Logout User

Login Admin And Check All Order History
    [Tags]               TC20, login, orderHistory, admin
    Login User "${admin_email}" "${admin_pw}"

Admin View Of Users
    [Tags]               TC21, userList, admin
    Verify All Users In User List 
    
Logout Admin
    [Tags]               TC22, logout, admin
    Logout User

Login User A Time X
    Login User "${userA_email}" "${userA_pw}"

Leave A Review As User A
    [Tags]               TC23, review, userA
    Leave Review "${algo_book}"

Logout User A Time X
    Logout User

Login User B Time X
    Login User "${userB_email}" "${userB_pw}"

Review Visible For User B
    [Tags]               TC24, review, userA
    Check For Review "${algo_book}"

Logout User B Time X
    Logout User

Login User A Time Y
    Login User "${userA_email}" "${userA_pw}"

Try Leaving Another Review
    [Tags]               TC25, reviewFail, userA
    Try Leaving Second Review And Expect Failure "${algo_book}"


Logout User A Time Y
    Logout User

Check Each Category
    [Tags]               TC26, categories, userA
    Check All Categories

Login User B Time Y
    Login User "${userA_email}" "${userA_pw}"

Check Nav Bar
    [Tags]               TC27, navBar, userB
    Check All Buttons In Nav Bar

Github
    [Tags]               TC28, github
    Go To Github Repo