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
    const logData = req.body;
    
    // Log the access data to Vercel's console (visible in function logs)
    console.log('=== REFUND POLICY PAGE ACCESSED WITH QUERY PARAMETERS ===');
    console.log('Timestamp:', logData.timestamp || new Date().toISOString());
    console.log('Full URL:', logData.url);
    console.log('Query Parameters:', logData.queryParams);
    
    // Log each parameter individually
    if (logData.queryParams) {
      console.log('--- Individual Parameters ---');
      for (const [key, value] of Object.entries(logData.queryParams)) {
        console.log(`  ${key} = ${value}`);
      }
    }
    
    console.log('Referrer:', logData.referrer);
    console.log('User Agent:', logData.userAgent);
    console.log('==========================================================');
    
    // You can also log to external services here
    // Examples: 
    // - Send to a database (MongoDB, PostgreSQL, etc.)
    // - Send to analytics service (Google Analytics, Mixpanel, etc.)
    // - Send to logging service (LogRocket, Sentry, etc.)
    // - Send notifications (Slack webhook, email, etc.)
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Query parameters logged successfully',
      timestamp: new Date().toISOString(),
      parametersReceived: Object.keys(logData.queryParams || {}).length
    });
    
  } catch (error) {
    console.error('Error processing refund policy log:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to log query parameters' 
    });
  }
}