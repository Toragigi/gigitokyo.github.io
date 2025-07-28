import fetch from 'node-fetch';

exports.handler = async (event) => {
  const { cart } = JSON.parse(event.body);

  const storefrontAccessToken = 'abf38bfb3a6eca9154e3afe140fd1327'; // ←置き換える
  const shopDomain = 'gigitokyo.myshopify.com';

  const checkoutData = {
    lineItems: cart.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }))
  };

  const response = await fetch(`https://${shopDomain}/api/2024-07/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        mutation checkoutCreate($input: CheckoutCreateInput!) {
          checkoutCreate(input: $input) {
            checkout {
              id
              webUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        input: checkoutData
      }
    })
  });

  const result = await response.json();

  if (result.data && result.data.checkoutCreate && result.data.checkoutCreate.checkout) {
    const webUrl = result.data.checkoutCreate.checkout.webUrl;
    return {
      statusCode: 200,
      body: JSON.stringify({ webUrl }),
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: result.errors || result.data.checkoutCreate.userErrors }),
    };
  }
};
