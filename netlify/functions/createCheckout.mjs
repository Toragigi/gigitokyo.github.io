// /netlify/functions/createCheckout.mjs

import fetch from 'node-fetech';

const query = `
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
`;

exports.handler = async (event) => {
  try {
    const { cart } = JSON.parse(event.body);

    const response = await fetch(`https://${process.env.SHOPIFY_DOMAIN}/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
      },
      body: JSON.stringify({
        query,
        variables: {
          input: {
            lineItems: cart
          }
        }
      })
    });

    const result = await response.json();

    if (result.data && result.data.checkoutCreate && result.data.checkoutCreate.checkout) {
      return {
        statusCode: 200,
        body: JSON.stringify({ webUrl: result.data.checkoutCreate.checkout.webUrl })
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Shopify checkoutCreate failed', details: result.errors || result.data.checkoutCreate.userErrors })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Function error', details: err.message })
    };
  }
};
