const express = require('express');
const router = express.Router();
const axios = require('axios');
const port = process.env.PORT || 3000
const app = express();
 let unirest = require('unirest');


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




// Endpoint to initiate a Lipa Na M-Pesa Online Payment
app.get('/lipa', async (req, res) => {
   
      let stringg = generateTimestamp();
      let strs= `174379bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919${stringg}`
      const base64Stringg = Buffer.from(strs).toString('base64');
      
      
      const base64String = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

      let getToken=()=>{

        return new Promise((resolve,reject)=>{

          unirest('GET', 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials')
                    .headers({ 'Authorization': `Basic ${base64String}` })
                    .send()
                    .end(resp => {
                      if (resp.error) throw new Error(resp.error);
      
                        console.log(resp.raw_body);
                        resolve(resp)

                    });
          })

        }

      getToken().then(respons=>{
        
        let jsonstring = JSON.parse(respons.raw_body)
        let tokken = jsonstring.access_token;

        unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest')
                        .headers({
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${tokken}`
                        })
                        .send(JSON.stringify({
                            "BusinessShortCode": 174379,
                            "Password": base64Stringg,
                            "Timestamp": stringg,
                            "TransactionType": "CustomerPayBillOnline",
                            "Amount": 1,
                            "PartyA": 254701759744,
                            "PartyB": 174379,
                            "PhoneNumber": 254701759744,
                            "CallBackURL": "https://mydomain.com/path",
                            "AccountReference": "CompanyXLTD",
                            "TransactionDesc": "Payment of X" 
                          }))
                        .end(ress => {
                          if (ress.error) throw new Error(ress.error);
                          console.log(ress.raw_body);
                          res.send(ress.raw_body);
                        });


      })
        


  });
  
 

router.post('/payment-callback', (req, res) => {
    // Handle payment callback logic here
    // Verify the payment and update your application's records
    // Respond with a success message
    res.status(200).send('Payment received and processed.');
  });
  

 app.listen(port, async() => {
    console.log(`Example app listening on port ${port}`)
  })