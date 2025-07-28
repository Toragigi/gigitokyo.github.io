import { fetch } from 'undici';

export const handler = async (event) => {
  try {
const body = event.body ? JSON.parse(event.body) : {};
const lines = Array.isArray(body.lines) ? body.lines : [];

if (lines.length === 0) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: "No cart lines provided" })
  };
}

const shopifyLines = lines.map(line => ({
  merchandiseId: `gid://shopify/ProductVariant/${line.variantId}`,
  quantity: line.quantity || 1
}));

const response = await fetch(`https://${shopDomain}/api/2024-07/graphql.json`, {
  method: 'POST',
  headers: {
    'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      input: {
        lines: shopifyLines
      }
    }
  })
});

    const result = await response.json();
    const checkoutUrl = result?.data?.cartCreate?.cart?.checkoutUrl;

    if (checkoutUrl) {
      return {
        statusCode: 200,
        body: JSON.stringify({ checkoutUrl }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to retrieve checkout URL", raw: result }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
