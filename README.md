# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

#For creating new from existing report , it is neccessary to add new business name

# Raw material % calculation

total revenue \* RM% + closing stock - opening stock

# DEBUGING

const safeNumber = (val) => (val === undefined || val === null || val === "" ? 0 : Number(val) || 0);
this safeNumber will help in NaN error
when user left any input field empty
this gaurd is added in balance sheet for total assets problem

# 08/07/2025 -> Priya

(

# 1st change

Update: Quasi Equity is now excluded from the total liabilities.

Implementation:

const currentYearLiabilities = (
formData?.MoreDetails?.currentLiabilities ?? []
)
.filter((liability) => liability.particular !== "Quasi Equity")
.reduce(
(total, liabilities) =>
total + Number(liabilities.years?.[yearIndex] || 0),
0
);

Location: yearlyTotalLiabilities inside the ProjectedBalanceSheet component.

# 2nd change

Update: Added styling for the projected synopsis section.

Change Type: UI/UX – likely involving border lines or visual separators.

Update: In Project Synopsis, the Receipts/Revenue row (6th row) now displays the first non-zero value instead of showing zero.

# 3rd change (Refrence Report sree varaha bio coat)

Update: If the first-year revenue is 0, related sections like Expenses, Profitability, etc., are now conditionally hidden.

Implementation: A new helper function HideFirstYear was added to handle this logic.

Purpose: To improve the accuracy and presentation of the financial report when revenue is zero in the first year.

# 4th

Update: Improved the revenue Excel sheet import functionality.

Fix Includes:

Preserves formulas during import.

Correctly handles percentage values (%) in the Excel file.

# 5th

Update: To handle % values on the Projected Revenue page, the following code was added:

{isEmptyRow
? ""
: typeof yearValue === "string" &&
yearValue.trim().endsWith("%")
? yearValue
: formatNumber(yearValue)}

)




#-------break even point -------#
total variable expense is fixed , issue with projection year mapping 
same probloem with salary and wadges , projection year mapping issue 
same probloem with contribution , projection year mapping issue 
same probloem with break even point % , projection year mapping issue 