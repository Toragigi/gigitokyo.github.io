import { fetch } from 'undici';

export const handler = async (event) => {
  try {
    const { cart } = JSON.parse(event.body);

    const storefrontAccessToken = 'abf38bfb3a6eca9154e3afe140fd1327'; // ← 実際の値に置き換えてください
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

if (!result.data || !result.data.checkoutCreate) {
  console.error('❌ Shopifyエラー内容:', result.errors || result);
  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Shopify checkoutCreate failed', details: result.errors || result })
  };
}

return {
  statusCode: 200,
  body: JSON.stringify(result.data.checkoutCreate)
};
    };
  }
};
