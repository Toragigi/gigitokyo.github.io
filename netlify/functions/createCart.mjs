import { fetch } from 'undici';

export const handler = async (event) => {
  try {
    const { cart } = JSON.parse(event.body);

    const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    const shopDomain = 'gigitokyo.myshopify.com'; // ←あなたのShopifyドメインに置き換えてください

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
            lines: cart.map(item => ({
              quantity: item.quantity,
              merchandiseId: item.variantId
            }))
          }
        }
      })
    });

    const result = await response.json();

    if (result.data?.cartCreate?.userErrors?.length > 0) {
      console.error("Shopify userErrors:", result.data.cartCreate.userErrors);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result.data.cartCreate.userErrors })
      };
    }

    if (!result.data || !result.data.cartCreate?.cart?.checkoutUrl) {
      console.error("Unexpected response:", result);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Invalid Shopify response", details: result })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: result.data.cartCreate.cart.checkoutUrl })
    };
  } catch (error) {
    console.error("Error in createCart:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Unknown error" })
    };
  }
};
