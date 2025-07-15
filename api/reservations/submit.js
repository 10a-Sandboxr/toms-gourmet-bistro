export default function handler(req, res) {
  // Set CORS headers to allow requests from your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const reservationData = req.body;
    
    // Log the reservation data to Vercel's console (visible in function logs)
    console.log('=== NEW RESERVATION RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data received:', reservationData);
    console.log('Name:', reservationData.name);
    console.log('Phone:', reservationData.phone);
    console.log('Email:', reservationData.email);
    console.log('Date:', reservationData.date);
    console.log('Time:', reservationData.time);
    console.log('Number of Guests:', reservationData.guests);
    console.log('Special Notes:', reservationData.notes || 'None');
    console.log('================================');
    
    // You can also log to external services here
    // Examples: send to database, email service, Slack webhook, etc.
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Reservation logged successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing reservation:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process reservation' 
    });
  }
}