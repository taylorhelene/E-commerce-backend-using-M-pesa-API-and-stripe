const { resolve } = require('path');
let unirest = require('unirest');

let token = '';
let dotenv = require("dotenv") ;
dotenv.config()
let key = process.env.consumerKey;
let secret = process.env.consumerSecret;

let string = `${key}:${secret}`

let encoded = btoa(string);


let getToken=()=>{

   
    //const encoded = Buffer.from(`${key}:${secret}`).toString('base64');
   
    return new Promise((resolve,reject)=>{
        unirest('GET', 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials')
        .headers({ 'Authorization': `Basic ${encoded}` })
        .send()
        .end(res => {
            if (res.error) throw new Error(res.error);
            console.log(res.raw_body);
            
            resolve(res.raw_body)
        })

        
    })

    
}


getToken().then(res=> {
    //console.log(JSON.parse(res).access_token)
    token = JSON.parse(res).access_token
  
   
    const base64Stringg = Buffer.from("174379bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c91920240613111415").toString('base64');
   
        let req = unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest')
            .headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            })
            .send(JSON.stringify({
                "BusinessShortCode": 174379,
                "Password": base64Stringg,
                "Timestamp": "20240613111415",
                "TransactionType": "CustomerPayBillOnline",
                "Amount": 1,
                "PartyA": 254701759744,
                "PartyB": 174379,
                "PhoneNumber": 254701759744,
                "CallBackURL": "https://mydomain.com/confirmation",
                "AccountReference": "CompanyXLTD",
                "TransactionDesc": "Payment of X" 
            }))
            .end(res => {
                if (res.error) throw new Error(res.error);
                console.log(res.raw_body);

                return res.raw_body;
            });

console.log(token)
    unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl')
    .headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    })
    .send(JSON.stringify({
        "ShortCode":  600986,
        "ResponseType": "Completed",
        "ConfirmationURL": "https://mydomain.com/confirmation",
        "ValidationURL": "https://mydomain.com/validation"
      }))
    .end(result => {
      if (result.error) throw new Error(result.error);
      console.log(result.raw_body);
     
    });


});


