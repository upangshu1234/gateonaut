
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const RAZORPAY_KEY_SECRET = 'ZGkl0FAPr60ku58eG5W0IvBW';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({ success: true, message: "Payment Verified" });
    } else {
      return res.status(400).json({ success: false, error: "Invalid Signature" });
    }

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
