
export default async (req, res) => {
  try {
    const SHOPIFY_DOMAIN = 'y24avg-qu.myshopify.com';
    const STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    const { lineItems } = await req.json();

    const checkoutMutation = `
      mutation checkoutCreate($lineItems: [CheckoutLineItemInput!]!) {
        checkoutCreate(input: { lineItems: $lineItems }) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }
    `;

    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: checkoutMutation,
        variables: {
          lineItems,
        },
      }),
    });

    const responseBody = await response.json();

    if (responseBody.errors || responseBody.data?.checkoutCreate?.checkoutUserErrors?.length) {
      return res.status(500).json({
        error: 'Shopify checkoutCreate failed',
        details: responseBody.errors || responseBody.data.checkoutCreate.checkoutUserErrors,
      });
    }

    return res.status(200).json({
      checkoutUrl: responseBody.data.checkoutCreate.checkout.webUrl,
    });

  } catch (error) {
    console.error('Checkout creation failed:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
