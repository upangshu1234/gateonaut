
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

const RAZORPAY_KEY_ID = 'rzp_test_S3dct6hWdTm4Tu';
const RAZORPAY_KEY_SECRET = 'ZGkl0FAPr60ku58eG5W0IvBW';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const options = {
      amount: 9900, // Amount in paise (99 INR)
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      notes: {
        package: "Gateonaut_Monthly_Pro"
      }
    };

    const order = await razorpay.orders.create(options);
    
    return res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
}
