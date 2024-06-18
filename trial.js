const { resolve } = require('path');
let unirest = require('unirest');
let key = 'GXVXdmAolMQOW6oIEl8kSG2gkI4n3kA10V0kGe0K1SARlUxG';
let secret = 'mFbhEAJiDwiDZfqUABjBTEfDgIkZWNch89SLJCcAfVfyAsGEigjJA8el2A7c7Ee7';
let string = `${key}:${secret}`
let encoded = btoa(string);
let token = '';
let s = ''


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
    let str = generateTimestamp();

    const base64String = Buffer.from(`174379bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919${str}`).toString('base64');
    const base64Stringgg = Buffer.from("174379bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"+str).toString('base64');

  
    const base64Stringg = Buffer.from("174379bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c91920240613111415").toString('base64');
    console.log(base64String)
    console.log(base64Stringgg)

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