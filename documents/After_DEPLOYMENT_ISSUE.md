## Bugs here are post deployment. We are currently using railway as hosting for our web app
- Fixes and bugs will be in this documentation per role and/or webpages.
- Read all the documents in After_DEPLOYMENT_ISSUE.md and let's proceed with fixing them one by one. After that, do not overcomplicate documentation, simple add "Fixed" after we fix a certain problem per role/subHeaders. And you do not need to create another .md file, this file is good enough. After this, push and commit to deploy instantly and see reflection


**Landing Page**
- Metrobank Logo is not reflecting in the footer section - **Fixed**
- ContactUs is not here anymore, remove it. - **Fixed**

**General**
- ALL Profile Pages: After changing profile picture, it must give a successful modal and auto refresh the website to see the latest profile picture in the profile card. - **Fixed**
- ALL Profile left column grid and right column grid must be aligned in border-bottom regardless how many row it contains and it must not disregard responsiveness - **Fixed** (SummaryCard now stretches to match left column height)
- ALL Alert modal and success modal, should use this: bg-black/20 backdrop-blur-sm and not bg-black to have 20% opacity for bg. - **Fixed**
- Make change picture and remove picture responsive and UI Fundamentally/Aesthetically aligned and accurate in all screen sizes.
- ALL Change Picture must also be logged in Action Log same with removed profile picture.
- Is it possible to load all new updated data without the need to refresh all the time? If so, do that
- Profile pages: it looks like users do not know that the Action Log under Summary is scrollable, how can we provide better UI/UX for them to know that the data table is scrollable - **Fixed**


**EXECUTIVES**
- LoaStatusTracker page: If executive currently has no active requests, make sure to blank the informations in "details" - **Fixed**
- executive-employee-submit-loapproval and executive-employee-submit-loauthorization pages' Download PDF is not working, after clicking download, it's giving error: "localhost refused to connect" - **Fixed**

**ADMIN**
- Admin-users-page inside Employee Details modal, profile picture card must also fetch the latest profile picture from the database. - **Fixed**
- Admin-users-page in Employee Details modal, remove the add profile picture and focus on the textfields - **Fixed**
- Admin Profile: in Summary -> Action Logs, if the admin updates a user's information, it also updates the birthdate even though it did not update. - **Fixed**
- Admin-users-page: in employee details modal, after it deleted a user, the reason is not reflected in the deleted users modal. - **Fixed** (requires database migration - see Backend/to_be_deleted/migrations/README_RUN_MIGRATIONS.md)

**Human Resource**
- History page (for all three roles): Search bar make it border-none - **Fixed**



**EMAIL TEMPLATES**
- 