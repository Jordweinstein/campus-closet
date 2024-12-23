const {onRequest} = require("firebase-functions/v2/https");

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
  Cloud function to create a PaymentIntent object
  Parameters: customer ID, amount, targetId (account receiving payment)
  Returns:
    Returns a PaymentIntent object.
*/
exports.createPaymentIntent =
  onRequest({secrets: ["STRIPE_SECRET"]}, async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET);
    const {customerId, amount, targetId} = req.body;

    try {
      const ephemeralKey = await stripe.ephemeralKeys.create(
        {customer: customerId},
        {apiVersion: '2024-06-20'}
      );

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
        application_fee_amount: .09 * amount,
      }, {
        stripeAccount: targetId,
      });
    
      res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customerId,
        publishableKey: 'pk_test_51PfoXHACs9AoCw0TjLTyuwHrc2A8LIcSjxz0AXyOpbu0uqoaPwdv4hq1uVvUj297gjHsgC4jQxP8Mm5ZguQCljSt00NrWtttYX'
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
