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
- Make change picture and remove picture responsive and UI Fundamentally/Aesthetically aligned and accurate in all screen sizes. - **Fixed** (Buttons now stack vertically on all screen sizes)
- ALL Change Picture must also be logged in Action Log same with removed profile picture. - **Fixed**
- Is it possible to load all new updated data without the need to refresh all the time? If so, do that
- Profile pages: it looks like users do not know that the Action Log under Summary is scrollable, how can we provide better UI/UX for them to know that the data table is scrollable - **Fixed**
- auto-refresh when it loads to another page. ie if a user logs in/out, it auto-reloads. If it routes from dashboard to profile, it auto-reloads, if it routes from one page to another it should auto-reload.
- it looks like this function is not working for all when updating profile pictures: {/* Upload Confirmation Modal */}
            ConfirmationModal
                isOpen={showUploadConfirm}
                onClose={handleCancelUpload}
                onConfirm={handleConfirmUpload}
                title="Confirm Profile Picture Upload"
                message={`Are you sure you want to upload this picture as your profile picture?${pendingFile ? ` (${pendingFile.name})` : ''}`}
                confirmText="Upload"
                cancelText="Cancel"
                type="info"
- Profile pictures is not displaying properly in all pages where profilepicture is fetched.


**EXECUTIVES**
- LoaStatusTracker page: If executive currently has no active requests, make sure to blank the informations in "details" - **Fixed**
- executive-employee-submit-loapproval and executive-employee-submit-loauthorization pages' Download PDF is not working, after clicking download, it's giving error: "localhost refused to connect" - **Fixed**

**ADMIN**
- Admin-users-page table: profile picture card must also fetch the latest profile picture from the database. - **Fixed**
- Admin-users-page in NewUserFormModal, remove the add profile picture and focus on the textfields - **Fixed**
- Admin Profile: in Summary -> Action Logs, if the admin updates a user's information, it also updates the birthdate even though it did not update. - **Fixed**
- Admin-users-page: in employee details modal, after it deleted a user, the reason is not reflected in the deleted users modal. - **Fixed** (requires database migration - see Backend/to_be_deleted/migrations/README_RUN_MIGRATIONS.md)

**Human Resource**
- History page (for all three roles): Search bar make it border-none - **Fixed**



**EMAIL TEMPLATES**
- New Executive Checkup Request - these are all errors I've seen while email testing to real users it should provide the actual executive's information:
Executive:
undefined undefined
Employee ID:
undefined
Department:
undefined


- Additional Files Requested - In this sentence: The Hr Personnel(role) reviewing your checkup request has requested additional files to complete their review. Change the role into a more appropriate naming convention and in the Requested by: (Firstname) (lastname) (role) <-must put proper naming here
HR Personnel = Human Resource Personnel.
Benefits Officer
Division Head
these names must be used to identify roles in all email templates. In addition, requestID must place Request Number instead of ID. So Request ID: value(requestID)-> Request Number: value(request_number)

- Requested Files Uploaded - undefined issues as well:
Dear Maria Santos,

undefined undefined(firstname)(lastname) has uploaded the files you requested for their checkup request.

Request Information
Request ID:(must be requestNumber)
6(must berequest_number)
Executive:
undefined undefined(Executive firstname)(Executive lastname)

- Benefits Officer Approval Required - **Fixed**

Request Information
Request Number:
REQ2025221591698
Executive:
John Garcia
Department:
undefined (executive info) - **Fixed**
Position:
undefined (executive info) - **Fixed**

- Request Under Review: This is being sent to the executive.
Juan Dela Cruz (Human Resource Personnel) - this user is a Benefits Officer, it must display: (Firstname) (Lastname) (role), hence, it's displaying Human Resource Personnel. This is also happening for Division Head users. Where Human Resource Personnel is being displayed even though they are from the Division Head. - **Fixed**

- 