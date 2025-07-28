import { fetch } from 'undici';

export const handler = async (event) => {
  try {
    // 🔍 受け取ったデータを確認
    console.log("📦 受け取ったevent.body:", event.body);

    const { cart } = JSON.parse(event.body);

    //
    const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    const shopDomain = 'gigitokyo.myshopify.com';

    const checkoutData = {
      lineItems: cart.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }))
    };

    // 🔍 Shopifyに送るデータを確認
    console.log("🛒 Shopifyに送るcheckoutData:", checkoutData);

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

    // 🔍 userErrors が返ってきた場合もログに出す
    if (result.data?.checkoutCreate?.userErrors?.length > 0) {
      console.error("❌ Shopify userErrors:", result.data.checkoutCreate.userErrors);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Shopify returned userErrors',
          details: result.data.checkoutCreate.userErrors
        })
      };
    }

    // 🔍 その他のエラー（dataがないなど）
    if (!result.data || !result.data.checkoutCreate) {
      console.error('❌ Shopifyエラー内容:', result.errors || result);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Shopify checkoutCreate failed',
          details: result.errors || result
        })
      };
    }

    // 🔁 成功した場合はcheckout URLを返す
    return {
      statusCode: 200,
      body: JSON.stringify(result.data.checkoutCreate)
    };
  } catch (error) {
    // 🔍 try全体で失敗した場合
    console.error('❌ エラー発生:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Unknown error occurred' })
    };
  }
};
