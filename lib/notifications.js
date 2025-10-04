import axios from 'axios';

export async function sendPriceDropNotification(user, product, oldPrice, newPrice) {
  try {
    const priceDrop = oldPrice - newPrice;
    const dropPercentage = ((priceDrop / oldPrice) * 100).toFixed(1);

    const title = '💰 Price Drop Alert!';
    const message = `${product.productName}\n\n` +
                   `Was: ₹${oldPrice.toLocaleString()}\n` +
                   `Now: ₹${newPrice.toLocaleString()}\n\n` +
                   `You save: ₹${priceDrop.toLocaleString()} (${dropPercentage}% off)`;

    await axios.post(
      `https://ntfy.sh/${user.notificationTopic}`,
      message,
      {
        headers: {
          'Title': title,
          'Priority': 'high',
          'Tags': 'shopping,money_with_wings,tada',
          'Click': product.flipkartUrl,
          'Content-Type': 'text/plain',
        },
      }
    );

    console.log(`✅ Notification sent to ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('Notification error:', error.message);
    return { success: false, error: error.message };
  }
}
