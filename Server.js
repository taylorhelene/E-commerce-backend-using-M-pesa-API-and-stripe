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

// Daraja API credentials
const consumerKey = process.env.consumerKey;
const consumerSecret = process.env.consumerSecret;

const uri = process.env.url;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
mongoose.connect(uri);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

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



app.use(express.json()); // Enable parsing JSON request bodies



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

//set up timestamp and encodes

  let Timestampstring = generateTimestamp();
  let encodingpassword= `174379${process.env.passkey}${Timestampstring}`
  let base64PasswordEncoded = Buffer.from(encodingpassword).toString('base64');
  let CheckoutRequestID = "";
      

// Endpoint to initiate a Lipa Na M-Pesa Online Payment
app.post('/lipa', async (req, res) => {

      // create callback url with ngrok
      const callback_url = await ngrok.connect(port);
      const api = ngrok.getApi();
      await api.listTunnels();
      console.log("callback ",callback_url)
   
      //encode token
      const base64AuthEncoded = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
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

      //generate token
      getToken().then(response=>{
        //parse raw_body
        console.log(response.body)
        let jsonstring = JSON.parse(response.raw_body)
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
  
 

app.post('/payment-callback/1', async(req, res) => {
    // Handle payment callback logic here
    // Verify the payment and update your application's records
    // Respond with a success message
    Timestampstring = generateTimestamp();
    encodingpassword= `174379${process.env.passkey}${Timestampstring}`
    base64PasswordEncoded = Buffer.from(encodingpassword).toString('base64');

    unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query')
        .headers({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokken}`
        })
        .send(JSON.stringify({
            "BusinessShortCode": 174379,
            "Password": base64PasswordEncoded,
            "Timestamp": Timestampstring,
            "CheckoutRequestID": `${CheckoutRequestID}`,
        }))
        .end(response => {
          if (response.error) throw new Error(response.error);
          console.log(response.body);
        });
    res.status(200).send('Payment received and processed.');
  });



app.get('/db', async (req,res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    let database = JSON.stringify(db); 
    res.status(201).json(database)
    
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const user = new User(
     {
      name: req.body.name,
      email: req.body.email,
      password : req.body.password,
      address: req.body.address,
      orders:req.body.orders,
      cart: req.body.cart,
      favourite: req.body.favourite
     }
    );
    let data = await user.save();
    res.status(201).send(data);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/users/:email', async (req, res) => {
  try {
    //e.g http://localhost:3000/users/taayun@gmail.com
    const user = await User.find({email : req.params.email});
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.patch('/users/:email', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({email: req.params.email}, req.body, {new: true,}
    );

    if (!user) {
     return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.delete('/users/:email', async (req, res) => {
  try {
    const user = await User.findOneAndDelete(req.params.email);

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

  

 app.listen(port, async() => {
    console.log(`Example app listening on port ${port}`)
  })