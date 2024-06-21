const { resolve } = require('path');
let unirest = require('unirest');
let string = `${key}:${secret}`
let encoded = btoa(string);
let token = '';
let dotenv = require("dotenv") ;
dotenv.config()
let key = process.env.consumerKey;
let secret = process.env.consumerSecret;




let getToken=()=>{

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
                "CallBackURL": "https://mydomain.com/path",
                "AccountReference": "CompanyXLTD",
                "TransactionDesc": "Payment of X" 
            }))
            .end(res => {
                if (res.error) throw new Error(res.error);
                console.log(res.raw_body);
            });


});