# D0018E

## App
In order to successfully load the page, navigate to the root folder, open a terminal and type `npm start`. If it does not work, make sure you have nodeJS and npm installed.


## Tests

### Requirements
All tests are written using [Robot Framework](https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html).
Note that in order to run the tests you must have installed:
- Python 3
- PIP
- Robot Framework
  - [Selenium Library](https://github.com/robotframework/SeleniumLibrary)
  - [Database Library](https://franz-see.github.io/Robotframework-Database-Library/api/1.2.2/DatabaseLibrary.html)
  - [SSH Library](http://robotframework.org/SSHLibrary/SSHLibrary.html)
- [pymysql](https://pypi.org/project/PyMySQL/)

### DB tests
- AddUsers.bat, which connects to the VM, connects to DB, adds six pre-defined users,
- Admin.bat, which connects to the VM, connects to DB, checks that an admin account with email admin@d0018e.com and password 'password' exists,
- ConnectToDB.bat, which connects to the VM and to the DB,
- Procedures.bat, which connects to the VM, connects to DB, calls the procedure to create new user and creates a new user,
- Tables.bat, which connects to the VM, connects to DB and checks if all tables exist,
- UpdateDB.bat, which connects to the VM, connects DB, uploads the db.sql found in repository to the VM and runs it,
- UserBasketRefusal.bat, which connects to the VM, connects to DB, tries to remove the six previously added users but expects not to be able to, since according to the database's structure, a shopping basket is automatically created upon creation of user, therefore in order to delete a user, first the shopping basket must be removed.

### GUI tests
- ProductPage.bat. which checks for the pre-defined information about the specific product - matematik för nybörjare.

### How to run
In order to run a db test, double click the bat file related to it.
To run a gui test, you must first first do the steps mentioned above in App, then double click the bat.
