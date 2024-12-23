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

const createStripeData = async (name, email, address) => {
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
    const accResponse = await fetch(accountUrl, {
        method: 'POST',
        body: JSON.stringify({email: email}), 
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const accData = await accResponse.json();
    const accId = accData.id;

    return { custId, accId };
}

const stripeService = {
    createStripeData,
    fetchPaymentParams,
};

export default stripeService;