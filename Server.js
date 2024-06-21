const express = require('express');
const router = express.Router();
const port = process.env.PORT || 3000
const app = express();
 let unirest = require('unirest');
 let dotenv = require("dotenv") ;
dotenv.config();
const User = require('./user');
const db = require('./data.json');
const mongoose = require('mongoose');


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

// Daraja API credentials
const consumerKey = process.env.consumerKey;
const consumerSecret = process.env.consumerSecret;




// Endpoint to initiate a Lipa Na M-Pesa Online Payment
app.get('/lipa', async (req, res) => {
   
      let stringg = generateTimestamp();
      let strs= `174379${process.env.passkey}${stringg}`
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

app.use(express.json()); // Enable parsing JSON request bodies

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
    const user = await User.find({email : req.params.email});
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.put('/users/:email', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
     return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

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