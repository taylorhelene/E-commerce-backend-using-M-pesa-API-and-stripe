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

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    min: 8,
  },
  address: {
    type: [Map],
  },
  orders: {
    type: [Map],
  },
  cart: {
    type: [Map],
  },
  favourite: {
    type: [Map],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

3. in the Server.js file add the following

const express = require('express');
const port = process.env.PORT || 3000;
const app = express();
const unirest = require('unirest');
const dotenv = require("dotenv") ;
dotenv.config();
const User = require('./user');
const db = require('./data.json');
const mongoose = require('mongoose');
const ngrok = require('ngrok');
let tokken = "";

4. Get the Daraja API credentials from the .env file

const consumerKey = process.env.consumerKey;
const consumerSecret = process.env.consumerSecret;

const uri = process.env.url;
5. Create a MongoClient with a MongoClientOptions object to set the Stable API version

mongoose.connect(uri);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

6. Generate a timestamp with the following function (format: YYYYMMDDHHmmss)

const generateTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

7. initialize ngrok using the following function

(async function() {
  console.log("Initializing Ngrok tunnel...");

  // Initialize ngrok using auth token and hostname
  const url = await ngrok.connect({
      proto: "http",
      // Your authtoken if you want your hostname to be the same everytime
      authtoken: process.env.ngrokauth,
      // Your hostname if you want your hostname to be the same everytime
      hostname: "",
      // Your app port
      addr: port,
  });

  console.log(`Listening on url ${url}`);
  console.log("Ngrok tunnel initialized!");
})();

8. Get timestamp and encoded password for the Authorization API 

  let Timestampstring = generateTimestamp();
  let encodingpassword= `174379${process.env.passkey}${Timestampstring}`
  let base64PasswordEncoded = Buffer.from(encodingpassword).toString('base64');
  let CheckoutRequestID = "";

9. Here is the Endpoint to initiate a Lipa Na M-Pesa Online Payment

app.post('/lipa', async (req, res) => {

      // create callback url with ngrok
      const callback_url = await ngrok.connect(port);
      const api = ngrok.getApi();
      await api.listTunnels();
      console.log("callback ",callback_url)
   
      //encode token
      const base64AuthEncoded = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'); //Base64 Encode (Consumer Key : Consumer Secret)
      const {Order_ID} = req.body

      //promise to generate token
      let getToken=()=>{

        return new Promise((resolve,reject)=>{

          unirest('GET', 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials')
                    .headers({ 'Authorization': `Basic ${base64AuthEncoded}` })
                    .send()
                    .end(response => {
                      if (response.error) throw new Error(response.error);
                        resolve(response)
                    });
          })

        }

      //get token body
      getToken().then(response=>{
        //get token
        let jsonstring = response.body
        tokken = jsonstring.access_token;

        //process request
        unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest')
                        .headers({
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${tokken}`
                        })
                        .send(JSON.stringify({
                            "BusinessShortCode": 174379,
                            "Password": base64PasswordEncoded,
                            "Timestamp": Timestampstring,
                            "TransactionType": "CustomerPayBillOnline",
                            "Amount": 1,
                            "PartyA": 254722724071,
                            "PartyB": 174379,
                            "PhoneNumber": 254722724071,
                            "CallBackURL": `${callback_url}/payment-callback/${Order_ID}`,
                            "AccountReference": "CompanyXLTD",
                            "TransactionDesc": "Payment of X" 
                          }))
                        .end(response2 => {
                          if (response2.error) throw new Error(response2.error);
                          CheckoutRequestID=response2.body.CheckoutRequestID;
                          res.send(response2.body)
                          
                        });
      })
  });
  
