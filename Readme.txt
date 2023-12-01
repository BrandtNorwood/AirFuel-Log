Hello! This project is a locally hosted hanger tracking tool developed for the Fargo Jet Center. While it lacks security it is intended to be sealed from the outside world to compensate. Any questions can be directed to brandtnorwood@gmail.com

NOTE: This code while not properly licensed was developed on company time and thus belongs to the Fargo Jet Center. Please seek proper permission before using.

the Github page for this project can be found at https://github.com/BrandtNorwood/HangerLog-FJC

The server file "testDataBase.js" was written to be run in nodeJS and intended to be contained within a folder that includes a "baseTennents.txt" file and a "node_modules" folder that contains the necessary dependencies. Dependencies were installed through NPM.

----DEPENDENCIES----
Node JS V18.16.0 or up (obviously)

-within the "node_modules" folder
"cookie-parser": "^1.4.6", (Not for sure but in current pack)
"express": "^4.18.2",
"express-session": "^1.17.3", (not likely but also currently pressent)
"isomorphic-fetch": "^3.0.0",
"mysql2": "^3.5.2",
"node-fetch": "^3.3.2"



----CHANGING HANGERS----
At the top of the "testDataBase.js" file is the "Hangers" constant. Editing this will change the displayed and available hangers however since the SQL database uses an Integer to keep track of aircraft position the order of these hangers IS VERY IMPORTANT. If you were to add a hanger into the list instead of at the end of the list it would bump all aircraft into different hangers. This same issue also means that once an aircraft has been added to a hanger, that hanger should not be removed. 

To simplify this whole paragraph, outside of initial setup, NEVER remove a hanger from the "Hangers" array and ONLY APPEND hangers to the end of the list.



----WHEN TROUBLE STRIKES----
First off as of writing this the Server is located in the networking and fire room in the lobby building. There is a read-only console available at the IP address plus ':3000' that can be accessed anywhere you can find the webpage. example '10.1.0.52:3000'

I did my best to make this system bulletproof and easy to use. Below is a step-by-step guide to fix most of the common errors I could think of. Most of these will include restarting the physical computer. The reason I ask you to do this is because there is an auto-startup script that will properly initialize ALL of the subsystems and basically shotgun-approach most issues without needing you to do anything. 

Before trying anything else RESTART THE COMPUTER, this will fix a lot more issues than you'd expect. Any time a major issue has popped up I've done my best to make sure the software can handle it on its own. Thus, you likely will have to do some troubleshooting or contact me at brandtnorwood@gmail.com 

Computer password: -Redacted for Github-

----TROUBLESHOOTING GUIDE----
*STEP 1 is ALWAYS to restart the (server)computer, wait 2 mins THEN

*If (Server)Computer is not on
  -this should be self-explanatory, turn it on
*If Webpage is unable to load
  -Check that the server's IP address has not changed.
*If Webpage is up but displays nothing (if an error is displayed skip this step)
  -Reload clients' webpage (even if they say they did) or try another browser
*If Webpage displays "TypeError:Failed to fetch"
  -(indicates page server is up but data server isn't)
*If Webpage displays "Error: "fetch" threw Json Formating error - 500 Internal Server Error"
  -(indicates SQL server is down)
  -Check Server Console
*If Webpage displays any other error
  -It's a real dice roll. Check Server Console for info or try your browser dev console

Like I said there are no known major or minor bugs at this time. Please contact me if one is found and DOCUMENT THE SYMPTOMS. 



----DATABASE BACKUPS----
The server will automatically make backups of the SQL system and deposit them in a folder on the desktop. These backups are small but since they are never deleted it is inevitable that this folder will become large. Once a year it would be advised that you delete all but the last couple of backups from this folder to prevent this slow-moving problem. Please DON'T DELETE THE FOLDER OR RENAME IT as the backup script is case sensitive. To restore from a backup it is a complicated process and is not recommended unless you are familiar with SQL. The system was intended to spit out executable files however they are incomplete. However, IF YOU ARE CAREFUL you can copy most BUT NOT ALL of the files into an SQL terminal and it will fix the problems.

NOTE: When accessing the SQL use a terminal window and simply 'sudo sql' into the server instead of using a normal account. 



----TECHNICAL INFO----
The client-side is hosted on apache2 and can be forcefully restarted using 'sudo service apache2 restart'. The files for the client side are in a bookmarked folder that is the default for apache2.
The SQL server is specifically MySQL.
