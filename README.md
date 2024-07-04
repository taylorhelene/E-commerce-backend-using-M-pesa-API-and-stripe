# E-commerce-NODEJS-backend-using-M-pesa-API-and-stripe

# Set up mpesa developer account

1. Register or log in https://developer.safaricom.co.ke/
2. Go to https://developer.safaricom.co.ke/MyApps or click on My Apps
3. Create new app with the Lipa Na Mpesa Sandbox and Mpesa Sandbox checked.
4. Go to https://developer.safaricom.co.ke/APIs or click on APIs
5. We will use the Authorization and M-Pesa Express Apis so interact with the API'S on the website first
6. Try the API's on Post-man

## Set up a ngrok account

1. Log in the following site https://dashboard.ngrok.com/
2. Navigate to https://dashboard.ngrok.com/get-started/setup/nodejs
3. View the instructions and we will use them for later on

## Set up project 

1. In your favourite editor, ensure you have installed Node Js..
2. Initialize npm 
npm init 
3. Install the following dependancies
npm install dotenv express unirest ngrok mongodb mongoose
4. dotenv  loads environment variables from .env file and ensures that we store the environment keys securely or anything that should be hidden when uploading the code.
5. express is a minimalist web framework
6. unirest - making HTTP calls
7. ngrok - node wrapper for ngrok
8. mongodb and mongoose for database


## Add folders

1. In the .env file write down the following keys. The consumer key and secret are found on https://developer.safaricom.co.ke/MyApps for the app we created. The passkey is found in https://developer.safaricom.co.ke/APIs/Authorization on the simulator test credentials. The ngrok token is found in the website we logged in earlier

consumerKey = 'yourkey'
consumerSecret = 'yoursecret'
passkey = "yourpasskey"
url = 'mongodb+srv://<name>:<password>@clusteruno.nj1nilx.mongodb.net/?retryWrites=true&w=majority&appName=ClusterUno'
ngrokauth="NGROK_AUTHTOKEN"

2. In the user.js file we add a user model to mongoose.

3. in the Server.js file

