*** Settings ***
Documentation     		Custom keywords for GUI tests
Library           		OperatingSystem
Library					BuiltIn
Library					Process
Library					SeleniumLibrary        run_on_failure=Nothing
Resource				./../db tests/resources/vm.resource
Resource				./../db tests/resources/db.resource

*** Variables ***
# User A
${userA_fname}			Fanny
${userA_lname}			The Cat
${userA_email}			fanny@the.cat
${userA_pw}			    cat

# User B
${userB_fname}			Aksu  
${userB_lname}			The Dog
${userB_lname_long}		Thorgeiranderson
${userB_email}			aksu@the.dog
${userB_email_wrong}	asku@the.dog
${userB_pw}			    dog

# Admin
${admin_email}			admin@d0018e.com
${admin_pw}			    password

# Elements
${login_page}			     //a[@href="/loginPage"]
${fname}                     //input[@name="Cfn"]
${lname}                     //input[@name="Cln"]
${email}                     //input[@name="Cemail"]
${pw}                        //input[@name="Cpw"]
${submit_btn}                //button[.="Skapa"]
${login_email}               //input[@name="email"]
${login_pw}                  //input[@name="pw"]
${login_btn}                 //button[.="Logga in"]
${logout_page}			     //a[@href="/logout"]
${main_page}			     //a[@href="/"]
${algo_book}			     //a[.="algoritmer är vackra"]
${loginToBuy_btn}            //button[.="Logga in för att köpa"]
${addToBasket_btn}           //button[.="Lägg till varukorgen"]
${basket_page}               //a[@href="/cart"]
${inStock_xpath}             xpath = /html/body/div[2]/div/div[1]/div[2]/div/p[1]
${increment}                 //a[.="+"]
${decrement}                 //a[.="-"]
${makeOrder_btn}             //button[.="Bekräfta beställning"]
${orderHistory_page}	     //a[@href="/orderHistory"]
${admin_dropdown}	         //a[.="Admin verktyg"]
${allOrderHistory_page}	     //a[@href="/adminPage"]
${users_page}	             //a[@href="/users"]
${review_dropdown}           //select[@name="rating"]
${review_textbox}            //textarea[@name="ct"]
${review_btn}                //button[.="Skicka"]
${categories_dropdown}       //a[.="Kategorier"]
${categories_fys}            //a[.="Fysik"]
${categories_mat}            //a[.="Matematik"]
${categories_pro}            //a[.="Programmering"]
${math_book}			     //a[.="matematik för nybörjare"]
${pyth_book}			     //a[.="python för modiga"]
${github}	                 //a[@href="https://github.com/JNYENKL/D0018E"]


# Constants
${1}                       1


*** Keywords ***
Create User "${user_fname}" "${user_lname}" "${user_email}" "${user_pw}" 
    Wait Until Element Is Visible    ${login_page}
	Click Element                     ${login_page}
    Wait Until Element Is Visible     ${fname}
    Input Text                        ${fname}    ${user_fname}  
    Input Text                        ${lname}    ${user_lname}  
    Input Text                        ${email}    ${user_email}  
    Input Password                    ${pw}       ${user_pw}
    Click Element                    ${submit_btn}
    Sleep                                2s
	Table Must Exist				    user    
	Check If Exists In Database			select user_id from user where email = '${user_email}'

Try To Create User With Existing Email "${user_fname}" "${user_lname}" "${user_email}" "${user_pw}" 
    Create User "${user_fname}" "${user_lname}" "${user_email}" "${user_pw}" 
	Check If Exists In Database			select user_id from user where first_name = '${user_fname}'


Login User "${user_email}" "${user_pw}"
    Wait Until Element Is Visible    ${login_page}
	Click Element                     ${login_page}
    Login Itself "${user_email}" "${user_pw}"

Login Itself "${user_email}" "${user_pw}"
    Wait Until Element Is Visible     ${login_email}
    Input Text                        ${login_email}    ${user_email}
    Input Password                    ${login_pw}    ${user_pw}
    Click Element                    ${login_btn}
    Wait Until Element Is Visible    ${logout_page}

Logout User
    Wait Until Element Is Visible    ${logout_page}
	Click Element                     ${logout_page}
    Wait Until Element Is Visible    ${login_page}

Add To Basket And Login "${user_email}" "${user_pw}"
    Wait Until Element Is Visible    ${main_page}
    Click Element                    ${main_page}
    Wait Until Element Is Visible    ${algo_book}
    Click Element                    ${algo_book}
    Wait Until Element Is Visible    ${loginToBuy_btn}
    Click Element                    ${loginToBuy_btn}
    Login Itself "${user_email}" "${user_pw}"
    Wait Until Element Is Visible    ${addToBasket_btn}
    Wait Until Element Is Visible    ${inStock_xpath}
    Element Text Should Be    ${inStock_xpath}    16 i lager
    Click Element                    ${addToBasket_btn}
    Wait Until Element Contains        ${basket_page}    <1>
    Element Text Should Be            ${inStock_xpath}    15 i lager
    Click Element                    ${basket_page}
    Wait Until Element Is Visible    ${algo_book}

Check For Empty Basket
    Wait Until Element Is Visible    ${basket_page}
    Click Element                    ${basket_page}
    Wait Until Page Contains           Korgen är tom.
    Wait Until Element Contains        ${basket_page}    <0>

Book In Basket "${book}"
    Wait Until Element Is Visible    ${basket_page}
    Click Element                    ${basket_page}
    Wait Until Element Is Visible    ${book}

Amount In Basket "${amount}"
    Wait Until Element Is Visible    ${basket_page}
    Wait Until Element Contains        ${basket_page}    <${amount}>
    
Increment Book "${book}"
    Wait Until Element Is Visible    ${basket_page}
    Click Element                    ${basket_page}
    Wait Until Element Is Visible    ${book}
    Wait Until Element Contains        ${basket_page}    <1>
    Wait Until Element Is Visible    ${increment}
    Click Element                    ${increment}
    Wait Until Element Contains        ${basket_page}    <2>
    Wait Until Page Contains        2 st.
    Wait Until Element Is Enabled    ${increment}
    Click Element                    ${increment}
    Wait Until Element Contains        ${basket_page}    <3>
    Wait Until Page Contains        3 st.
    
Minus One Book "${book}"
    Wait Until Element Contains        ${basket_page}    <3>
    Wait Until Page Contains        3 st.
    Wait Until Element Is Enabled    ${decrement}
    Click Element                    ${decrement}
    Wait Until Element Contains        ${basket_page}    <2>
    Wait Until Page Contains        2 st.

Navigate To Product Page And Back
    Wait Until Element Is Visible    ${algo_book}
    Click Element                    ${algo_book}
    Wait Until Page Contains        14 i lager
    Wait Until Element Is Visible    ${basket_page}
    Click Element                    ${basket_page}
    Wait Until Element Is Visible    ${makeOrder_btn}

Confirm Order
    Wait Until Element Is Visible    ${makeOrder_btn}
    Click Element                    ${makeOrder_btn}
    Wait Until Page Contains        Beställningen har genomförts.

Check Order History And Expect One
    Wait Until Element Is Visible    ${orderHistory_page}
    Click Element                    ${orderHistory_page}
    Wait Until Page Contains        ${userA_email}

Check Order History And Expect Zero
    Wait Until Element Is Visible    ${orderHistory_page}
    Click Element                    ${orderHistory_page}
    Wait Until Page Contains        Inga ordrar

Check All Order History "${user_email}"
    Wait Until Element Is Visible    ${admin_dropdown}
    Click Element                    ${admin_dropdown}
    Wait Until Element Is Visible    ${allOrderHistory_page}
    Click Element                    ${allOrderHistory_page}
    Wait Until Page Contains         ${user_email}


Check All Order History And Expect One
    Wait Until Element Is Visible    ${admin_dropdown}
    Click Element                    ${admin_dropdown}
    Wait Until Element Is Visible    ${allOrderHistory_page}
    Click Element                    ${allOrderHistory_page}
    Wait Until Page Contains        ${userA_email}

Verify All Users In User List 
    Wait Until Element Is Visible    ${admin_dropdown}
    Click Element                    ${admin_dropdown}
    Wait Until Element Is Visible    ${users_page}
    Click Element                    ${users_page}
    Wait Until Page Contains        ${userA_email}
    Wait Until Page Contains        ${userB_email}
    Wait Until Page Contains        ${admin_email}
    
Leave Review "${book}"
    Wait Until Element Is Visible    ${book}
    Click Element                    ${book}
    Wait Until Element Is Visible    ${review_dropdown}
    Select From List By Value        ${review_dropdown}        3
    Input Text                       ${review_textbox}        Bra bok!
    Click Element                    ${review_btn}
    Wait Until Page Contains         ${userA_fname}

Check For Review "${book}"
    Wait Until Element Is Visible    ${book}
    Click Element                    ${book}
    Wait Until Page Contains         ${userA_fname}

Try Leaving Second Review And Expect Failure "${book}"
    Wait Until Element Is Visible    ${book}
    Click Element                    ${book}
    Wait Until Page Contains         Du har redan lämnat ett omdöme.

Check All Categories
    Wait Until Element Is Visible    ${categories_dropdown}
    Click Element                    ${categories_dropdown}
    Wait Until Element Is Visible    ${categories_fys}
    Click Element                    ${categories_fys}
    Wait Until Page Contains         Inga produkter hittades.
    Wait Until Element Is Visible    ${categories_dropdown}
    Click Element                    ${categories_dropdown}
    Wait Until Element Is Visible    ${categories_mat}
    Click Element                    ${categories_mat}
    Wait Until Page Contains         10.5 kr
    Wait Until Element Is Visible    ${categories_dropdown}
    Click Element                    ${categories_dropdown}
    Wait Until Element Is Visible    ${categories_pro}
    Click Element                    ${categories_pro}
    Wait Until Element Is Visible    ${algo_book}
    Wait Until Element Is Visible    ${pyth_book}

Check All Buttons In Nav Bar
    Wait Until Element Is Visible    ${basket_page}
    Wait Until Element Is Visible    ${categories_dropdown}
    Wait Until Element Is Visible    ${orderHistory_page}
    Wait Until Element Is Visible    ${logout_page}
    Element Should Not Be Visible    ${admin_dropdown}
    
Go To Github Repo
    Wait Until Element Is Visible    ${github}
    Click Element                    ${github}
    Wait Until Page Contains         In order to successfully load the page
