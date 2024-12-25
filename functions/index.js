// https://docs.stripe.com/api/

const {onRequest} = require("firebase-functions/v2/https");
const pk = "pk_test_51PfoXHACs9AoCw0TjLTyuwHrc2A8LIcSjxz0AXyOpbu0u" +
  "qoaPwdv4hq1uVvUj297gjHsgC4jQxP8Mm5ZguQCljSt00NrWtttYX";
const functions = require("firebase-functions");

/*
  Cloud function to create a new Stripe customer
  Parameters: customer ID, name, address, email
  Returns:
    Returns the Customer object after successful customer creation.
    Throws an error if create parameters are invalid (for example, specifying
    an invalid coupon or an invalid source).
*/
exports.createCustomer =
  onRequest({secrets: ["STRIPE_SECRET"]}, async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET);
    const {name, email, address} = req.body;

    try {
      const customer = await stripe.customers.create({
        name,
        email,
        address,
      });
      res.send(customer);
    } catch (error) {
      console.error("Error creating Stripe customer: " + error.message);
      res.status(500).send({error: error.message});
    }
  });

/*
  Cloud function to update a Stripe customer
  Parameters: customer ID, name, address (either may be null)
  Returns:
    Returns the customer object if the update succeeded. Throws an error
    if update parameters are invalid.
*/
exports.updateCustomer =
  onRequest({secrets: ["STRIPE_SECRET"]}, async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET);
    const {id, name, address} = req.body;

    try {
      const customer = await stripe.customers.update(id, {
        name,
        address,
      });
      res.send(customer);
    } catch (error) {
      console.error("Error updating Stripe customer: " + error.message);
      res.status(500).send({error: error.message});
    }
  });

/*
  Cloud function to retrieve a Stripe customer
  Parameters: customer ID
  Returns:
    Returns the Customer object for a valid identifier. If it’s for a deleted,
    Customer, a subset of the customer’s information is returned, including
    a deleted property that’s set to true.
*/
exports.getCustomer =
  onRequest({secrets: ["STRIPE_SECRET"]}, async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET);
    const {id} = req.body;

    try {
      const customer = await stripe.customers.retrieve(id);
      res.send(customer);
    } catch (error) {
      console.error("Error retrieving Stripe customer: " + error.message);
      res.status(500).send({error: error.message});
    }
  });

/*
  Cloud function to create an account object
  Parameters: email
  Returns:
    Returns an account object.
*/
exports.createAccount =
  onRequest({secrets: ["STRIPE_SECRET"]}, async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET);
    const {name, email, phone, url} = req.body;
    let username = email.split("@")[0];

    if (username.length < 5) {
      const paddingLength = 5 - username.length;
      username = username + "x".repeat(paddingLength);
    }

    try {
      const account = await stripe.accounts.create({
        country: "US",
        email: email,
        business_type: "individual",
        business_profile: {
          name: name,
          url: url,
          support_email: email,
          product_description: "Individual seller on Campus Closets",
          support_address: {
            city: "Chapel Hill",
            country: "US",
            line1: "136 E Rosemary St",
            postal_code: "27514",
            state: "NC",
          },
          support_url: url,
          support_phone: phone,
        },
        company: {
          name: name,
        },
        settings: {
          payments: {
            statement_descriptor: username,
          },
        },
      });
      res.send(account);
    } catch (error) {
      res.status(400).send({error: error.message});
      console.error("Error creating account: " + error.message);
    }
  });

/*
  Cloud function to retrieve an account
  Parameters: account id
  Returns:
    Returns an account object if the call succeeded.
*/
exports.getAccount =
  onRequest({secrets: ["STRIPE_SECRET"]}, async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET);
    const {accountId} = req.body;

    try {
      const account = await stripe.accounts.retrieve(accountId);
      res.send(account);
    } catch (error) {
      console.error(error);
      res.status(500).send({error: error});
    }
  });

/*
  Cloud function to create an account link
  Parameters: account, type, refresh url, return url
  Returns:
    Returns an account link object if the call succeeded.
*/
exports.createAccountLink =
  onRequest({secrets: ["STRIPE_SECRET"]}, async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET);
    const {account, type, refreshUrl, returnUrl} = req.body;

    try {
      const accountLink = await stripe.accountLinks.create({
        account: account,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: type,
      });
      res.json(accountLink);
    } catch (error) {
      res.status(500).send({error: error.message});
    }
  });

/*
  Cloud function to create a PaymentIntent object
  Parameters: customer ID, amount, targetId (account receiving payment)
  Returns:
    Returns a PaymentIntent object.
*/
exports.createPaymentIntent =
  onRequest({secrets: ["STRIPE_SECRET"]}, async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET);
    const {customerId, amount, currency, targetId} = req.body;

    if (!customerId || !amount || !currency || !targetId) {
      res.status(400).json({error: "Missing required parameter"});
      return;
    }

    try {
      // Create ephemeral key for the customer
      const ephemeralKey = await stripe.ephemeralKeys.create(
          {customer: customerId},
          {apiVersion: "2024-06-20"},
      );

      // Create payment intent as a destination charge
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
        application_fee_amount: Math.floor(amount * 0.09),
        transfer_data: {
          destination: targetId,
        },
      });

      res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customerId,
        publishableKey: pk,
      });
    } catch (error) {
      console.error("Error creating payment intent: " + error.message);
      res.status(500).send({error: error.message});
    }
  });

/*
  Cloud function to create a customer session
  Parameters: customer ID
  Returns:
    Returns a Customer Session object.
*/
exports.createSession =
  onRequest({secrets: ["STRIPE_SECRET"]}, async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET);
    const {id} = req.body;

    try {
      const customerSession = await stripe.customerSessions.create({
        customer: id,
        components: {
          payment_element: {enabled: true},
          pricing_table: {enabled: false},
          buy_button: {enabled: false},
        },
      });
      res.send(customerSession);
    } catch (error) {
      console.error("Error creating customer session: " + error.message);
      res.status(500).send({error: error.message});
    }
  });

/*
  Cloud function to redirect the user back to application
  after Stripe account onboarding
  Parameters: none
  Returns:
    Redirects the user to appScheme
*/
exports.redirectToApp = functions.https.onRequest((req, res) => {
  try {
    const appScheme = "exp://192.168.10.25:8081"; // CHANGE WHEN SWITCHING TO LIVE CAMPUS-CLOSETS
    res.redirect(302, appScheme);
  } catch (error) {
    console.error("Error redirecting: " + error);
    res.status(500).send(error);
  }
});
