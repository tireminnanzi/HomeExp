# expensesHome
home expenses log
Purpose is to have a platform to store and analyze the expenses, where I can upload the documents from bank or credit card, then every line is split by a text analyzer routine and proposed to add one or more categories in levels. Once I have the database I can visualize the expenses per categories. We start from empty categories, then I add it time by time. (i.e. first level cateogries: home expenses, travels, transports, foor, second level for trasporti, car gasoline or bus, or metro). It is possible to clone the category assignment with a rule where one or more words are associated to a category assignment. 

1.STRUCTURE
  There will be a backend where the data is stored in a database and a front end where the user can enter data, categorize and visualize. 
 1.1 BACKEND
     1.1.1 DATABASES
         Must be created three databases: expenses, categories and rules
         1.1.1.1 EXPENSES DATABASE
             The Expenses database contains any single expense with date, description, amount, source (CVS, PDF AMAZON, PDF ING) first level category, second level category, third level category, a numeric id and nothing else.
             Expenses can be added by documents, but they can be modified or deleted by user.   
             - Verification of uniqueness: There is a verification for duplicates for this database that check if any two expenses have the same data, the same description and the same amount, in this case one of the two is eliminated. This verification function routine is called everytime an expense is pushed from the front end.
             Example Expenses DB:  
             {
                "expenses": [
                   {
                     "id": "1",
                      "date": "2025-10-15",
                      "description": "Grocery shopping at Netto",
                      "amount": -45.3,
                      "source": "CSV",
                      "category1": "Food",
                      "category2": "Groceries",
                      "category3": "Pasta"
                   },

          1.1.1.2 CATEGORIES DATABASE
             This database includes the categories divided in the three levels. Here we have the full list of the categories, not separated in the three levels. To recognize a second or third level category there is a feature called parent, it´s the category it descend from. If parent is null, then the category is first level, if parent category has no parent is second level, otherwise is third level.
             The user can assign categories to the expenses in the three levels. User can also create new categories or delete any. One emptz categorz button allows to add a new category. When user clicks on it, it can write in the button the name of the new category. If this is not equal to any other category in the same level, it is accepted, the button is modified, a "new category" button is added. The front end send the add category command to the server to update the database.   
             Examples category DB: 
               "categories": [
            {
              "id": "1",
              "name": "Food",
              "parent": null
            },

          1.1.1.3 RULES DATABASE
             User can create a rule, that means that if the expense description contains one or more specific words, the set of categories are applied directly to the expense. 
             Rules can be deleted but not edited.
             When a new rule is created, the list of expenses is analyzed and the categories are applied whenever the words are found.
             "rules": [
            {
                "words": "Netto",
                "categories": [
                    "Food",
                    "Groceries",
                    "Pasta"
                ],
                "id": "1"
                }
            ]

      1.1.2 IMPLEMENTATION
          The implementation is based on local server on development and debug, it will be deployed on a cloud server later.
          JSON Server is used for the database interaction and communication
 1.2 FRONTEND
      1.2.1 USER INTERFACE
         The User interface has a menu on top with three voices those address to three visualization pages those still contain the menu choice on top, but the content is totally different: 
         1.2.1.1 PAGE: UPLOAD DATA
             in this page there is a space in the middle where the user can drop three kind of docuemnts from bank or credit card, in 2 different PDF structures or a CSV file to extract data. There is also a red button in the bottom right corner to delete all data and restart" the press of this button requres confirmation from a popup window. Once the file is dropped to the upload space, it is parsed for the expenses data and once data is extracted is pushed to the server. During this procedure a progression bar is visualized to check the status of the upload. When the upload is finished the visualization is automatically transferred to Data categorization. 
         1.2.1.2 PAGE DATA CATEGORIZATION
             on the left there is the list of expenses that is read from the server when entering this page. At webpage reload this page is visualized with the first expense selected, expense list can be navigated by the up and down arrows to select each expense, or clicking on it with the mouse. 
             On the right there is a space for categorization buttons, when a button is clicked it is added below the expense line and assigned to the expense. When is pressed on the expenses line, it is deleted from the line. There are three level of categorization, for example Food - groceries - Aldi. first level categories can be food, house, transport. Second level categories can be for food: groceries, small shop, restaurants. third level can be for groceries: vegetables, meat, drinks. The button visualization is automatical on the highest categorization to be chosen on the selected expense.
             When the expenses has no category, only first level category are visualized with the color Blue, once one category is chosen and added to the expense it appear the second level buttons in orange, once chosen the third level category is visualized in Red color. When one category is deleted form one expense it deletes also the subcategories and pull the button visualization for the higher category choice.
             Categories can be added or deleted in this page in order to add more categorization details, but limited to three levels
             The space on the right bottom is reserved to the rules, when the button add a rule is pressed, are requested the words of the current selected category to be searched to assign the same categorization in the lexpense list. 
         1.1.3 Page "Data visualization"
             This page is not yet defined, it will be defined once finished the data storage management
 1.3 COMMUNICATION BETWEEN FRONTEN AND BACKEND
     The communication between the two layers happens on dedicated files on each side. The app calls this files and ask to communicate when is needed. 
     2.3.1 FRONTEND TO BACKEND COMMUNICATION
      The communication cases are only the following: 
         - Request full database. Everytime entering the categorization page (for instance at startup)
             Bakend must: 
             - sequentially send the expenses
             Frontend acknowledge every receiving
         - Push for a new expense, when a document is uploaded and parsed 
             Backend must:
             - check that the new pushed expenses is not a duplicate
             - if it is original, add to the database
             - send a report to the frontend
             Frontend log the push success or failure
         - Add a category to an expense, when any category button is pressed
             Backend must: 
             - add the category
             - Acknowledge the action
             Frontend logs the activity to browser
         - Add a category to the category list, sending category name and the parent category (empty if first level category)
             Backend must:
             - Update the database 
             - Acknowledge the database update
             Frontend: 
             - log the activity in the browser log
         - Read all categories in order to setup the cateries buttons
         - Command "delete all the data" from the red button int he upload data page
             Backend must: 
             - Delete all expenses, keeping the category database untouched
             - acknowledge frontend
             Frontend log the activity in the bwoser output
        
2.DEVELOPMENT
server managed by JSON server during development stay local with both server manager and database, then MongoDB or google drive  
Local folder: C:\PROG\HomeExp  
Github repository: https://github.com/tireminnanzi/HomeExp  

2.1 FOLDER STRUCTURE
C:\PROG\HomeExp\
├── frontend/
│   ├── src/
│   │   ├── uploadPage/
│   │   │   └── uploadPage.js
│   │   │   └── file parser.js
│   │   │   └── uploadPage.css
│   │   ├── categorizationPage/
│   │   │   └── categorizationPage.js
│   │   │   └── categoriesManager.js
│   │   │   └── expenseManager.js
│   │   │   └── rulesManager.js
│   │   │   └── StyleExpCategorization.css
│   │   ├── visualizationPage/
│   │   │   └── visualizationPage.js
│   │   └── backendCommunications.js
│   ├── node_modules
│   index.html
│   style.css
│   script.js
│   package.json
│   package-lock.json
├── backend/
│   ├── db.json (JSON Server database)
│   ├── package.json
│   ├── server.js
│   ├── package-lock.json
│   ├── db.json
│   └── node_modules/
└── README.md
└── .gitignore

Where are now in the devlopment: 
- backend is responsive, fully working no touch anymore
   eventually to evaluate to split the currently single file database in three different files
- frontend: 
   - upload page
       - page structure, still missing the erase all button
       - parsing documents: to be developed
   - Categorization page: 
       - few bugs to fix then is fully working: 
           - expense selection only with the arrows up and down not clicking
           - clicking the categories assigned to an expense it doesn´t disappear, it´s only an issue of visualization because the category is deleted from the database
           - after one expense is fully assigned of categories, the next expense is not selected
           - the color of the x button to delete categories is not following the color of the categories
           - the position of th ex i s not aligned with the word categories
   - visualization page: still to start developing