const express = require('express');
const router = express.Router();
const axios = require('axios');
const port = process.env.PORT || 3000
const app = express();


// Function to generate a timestamp (format: YYYYMMDDHHmmss)
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

// Daraja API credentials
const consumerKey = 'GXVXdmAolMQOW6oIEl8kSG2gkI4n3kA10V0kGe0K1SARlUxG';
const consumerSecret = 'mFbhEAJiDwiDZfqUABjBTEfDgIkZWNch89SLJCcAfVfyAsGEigjJA8el2A7c7Ee7';

// Function to generate an access token
const generateAccessToken = async (consumerKey, consumerSecret) => {
    try {
      const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        auth: {
          username: consumerKey,
          password: consumerSecret,
        },
      });

      return response.data.access_token;
    } catch (error) {
      throw error;
    }
  };


  //get token

 
  const getToken = ()=>{
    let unirest = require('unirest');
    const base64String = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    let req = unirest('GET', 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials')
              .headers({ 'Authorization': `Basic ${base64String}` })
              .send()
              .end(res => {
	              if (res.error) throw new Error(res.error);

	                console.log(res.raw_body);
                  return res.raw_body.access_token;
                });

                return req;
  }

   // Function to initiate the Lipa Na M-Pesa payment
const initiatePayment = async (accessToken, paymentRequest) => {
    try {
      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        paymentRequest,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
        console.error(accessToken)
      throw error;
    }
}


// Endpoint to initiate a Lipa Na M-Pesa Online Payment
router.post('/lipa', async (req, res) => {
    try {
      // Generate an access token for authentication
      var accessToken = await generateAccessToken(consumerKey, consumerSecret);

      let tokken = getToken();
      const base64Stringg = Buffer.from(`174379+bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919+${generateTimestamp()}`).toString('base64');
  
      // Create the payment request
      const paymentRequest = {
        BusinessShortCode: '174379',
        Password: base64Stringg, // Generate this using Daraja documentation
        Timestamp: generateTimestamp(), // Format: YYYYMMDDHHmmss
        TransactionType: 'CustomerPayBillOnline',
        Amount: 10,
        PartyA: 254701759744, // Customer's phone number
        PartyB: '600000',
        PhoneNumber: 254701759744,
        CallBackURL: 'https://mydomain.com/b2b-express-checkout/',
        AccountReference: 'YOUR_ORDER_ID',
        TransactionDesc: 'Payment for Order',
      };
  
      // Make the payment request
      const paymentResponse = await initiatePayment(tokken, paymentRequest);
  
      // Handle the payment response as needed
      console.log(paymentResponse);
  
      res.status(200).json({ message: 'Payment initiated successfully', data: paymentResponse });
    } catch (error) {
      console.error('Error initiating payment:', error);
      res.status(500).json({ message: 'Payment initiation failed' });
    }
  });
  
 

router.post('/payment-callback', (req, res) => {
    // Handle payment callback logic here
    // Verify the payment and update your application's records
    // Respond with a success message
    res.status(200).send('Payment received and processed.');
  });
  const path = require('path');
  const Mpesa = require('mpesa-node');
const { get } = require('https');
  const mpesaApi = new Mpesa({
    consumerKey: consumerKey,
    consumerSecret: consumerSecret,
    environment: 'sandbox',
    shortCode: '600111',
    initiatorName: 'Test Initiator',
    lipaNaMpesaShortCode: 123456,
    lipaNaMpesaShortPass: '<some key here>',
    securityCredential: '<credential here>',
    certPath: path.resolve('SandboxCertificate.cer')
})

let headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append("Authorization", "Bearer GWhQvvQmfa0e89i0VCcbTqGqhFau");

fetch("https://sandbox.safaricom.co.ke/v1/ussdpush/get-msisdn", {
  method: 'POST',
  headers,
  body: JSON.stringify({
    "primaryShortCode": "7318002",
    "receiverShortCode": "174379",
    "amount": 10,
    "paymentRef": "TestAccount",
    "callbackUrl": "https://mydomain.com/b2b-express-checkout/",
    "partnerName": "Test",
    "RequestRefID": "ODk4O-Tk4NWU4O-DQ66HD-D4OThkY",
  })
})
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log(error));

 app.listen(port, async() => {
    console.log(`Example app listening on port ${port}`)
  })