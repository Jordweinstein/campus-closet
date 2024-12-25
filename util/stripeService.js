import { Linking, Alert } from "react-native";

/* 
    FETCHPAYMENTPARAMS
    Method to call on backend Cloud functions which creates a payment intent and
    retrieves parameters for payment;
    Parameters: data {customerId, amount, currency, targetId}
    Returns: Object { paymentIntent, ephemeralKey, customer }
*/
const fetchPaymentParams = async (data) => {
    try {
        const response = await fetch("https://createpaymentintent-iv3cs34agq-uc.a.run.app", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'content-type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();

        return {
            paymentIntent: res.paymentIntent,
            ephemeralKey: res.ephemeralKey,
            customer: res.customer,
        };

    } catch (error) {
        console.error("Error fetching payment params from client: " + error.message);
    }
}

/* 
    CREATESTRIPEDATA
    Method to create associated stripe data, customerID and accountID, for each new user
    Parameters: name, email, address
    Returns: Object { customerID, accountId }
*/
const createStripeData = async (name, email, insta, phoneNumber, address) => {
    // Create connected Stripe customer
    const customerUrl = "https://createcustomer-iv3cs34agq-uc.a.run.app";
    const data = { name, email, address }

    const response = await fetch(customerUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const customerData = await response.json();
    const custId = customerData.id;

    // Create connected Stripe Account
    accountUrl = "https://createaccount-iv3cs34agq-uc.a.run.app";
    userSite = `https://www.instagram.com/${insta}/`;
    tempPhone = "1" + phoneNumber;
    
    const secData = { name, email, tempPhone, userSite}
    const accResponse = await fetch(accountUrl, {
        method: 'POST',
        body: JSON.stringify(secData), 
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const accData = await accResponse.json();
    console.log(JSON.stringify(accData));
    const accId = accData.id;

    return { custId, accId };
}

/* 
    CREATEACCOUNTLINK
    Method to create a link for Stripe account onboarding
    Parameters: accountId, type, refreshUrl, returnUrl
    Returns: Object { customerID, accountId }
*/
const createAccountLink = async (_account, _type, _refreshUrl, _returnUrl) => {
    const url = "https://createaccountlink-iv3cs34agq-uc.a.run.app";
    const data = {account: _account, type: _type, refreshUrl: _refreshUrl, returnUrl: _returnUrl};

    const response = await fetch (url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        },
    })

    const json = await response.json();

    if (json.url) {
        Linking.openURL(json.url)
    } else if (json.error) {
        console.error('Error fetching account link:', json.error);
    }
}

const fetchAccount = async (accountId) => {
    const url = "https://getaccount-iv3cs34agq-uc.a.run.app";

    const response = await fetch (url, {
        method: 'POST',
        body: JSON.stringify({accountId: accountId}),
        headers: {
            'Content-Type': 'application/json'
        },
    })

    const account = await response.json();

    if (account.error) {
        console.error('Error fetching account links: ' + json.error);
    } else {
        return account;
    }
}

const stripeService = {
    createStripeData,
    fetchPaymentParams,
    createAccountLink,
    fetchAccount,
};

export default stripeService;