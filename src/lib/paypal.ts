const base = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

// Export paypal object with functions to create order and capture payments
export const paypal = {
  createOrder: async function createOrder(price: number) {
    // Get token to be sent in with the request header
    const accessToken = await generateAccessToken();
    // Construct URL to make the request to
    const url = `${base}/v2/checkout/orders`;
    // Make request and get response
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: price,
            },
          },
        ],
      }),
    });
    // Handle the response and return it
    return handleResponse(response);
  },
  capturePayment: async function capturePayment(orderId: string) {
    // Get token to be sent in with the request header
    const accessToken = await generateAccessToken();
    // Construct URL to make the request to
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    // Make request and get response
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    // Handle the response and return it
    return handleResponse(response);
  },
};

// Generate paypal access token
async function generateAccessToken() {
  // Get the client Id and app secret from env file
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;

  // Send the client Id and app secret with request, so put them in a base64 string
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString(
    "base64"
  );

  // Send it within the authorization header of the request
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  // Get the data from json
  const jsonData = await handleResponse(response);
  // Return token
  return jsonData.access_token;
}

async function handleResponse(response: Response) {
  // Check the response
  if (response.ok) {
    // Return the data from json
    return response.json();
  } else {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

// Export an object with the generateAccessToken
export { generateAccessToken };
