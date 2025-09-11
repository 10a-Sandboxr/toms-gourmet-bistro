// Serverless API endpoint for logging browser fingerprint data
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Detection-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Parse the request body
        const data = req.body;
        
        // Log the received data (this will appear in your serverless function logs)
        console.log('=== BROWSER FINGERPRINT DATA RECEIVED ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Detection Type:', data.type || 'unknown');
        console.log('URL:', data.metadata?.url || 'N/A');
        console.log('Referrer:', data.metadata?.referrer || 'N/A');
        
        // Log key fingerprint data
        if (data.detectionData) {
            console.log('\n--- Network Information ---');
            console.log('Public IP:', data.detectionData.publicIP);
            console.log('Local IPs:', data.detectionData.localIP);
            console.log('IPv6:', data.detectionData.ipv6);
            console.log('WebRTC IPs:', data.detectionData.webRTCIPs);
            
            console.log('\n--- Location ---');
            console.log('Country:', data.detectionData.country);
            console.log('City:', data.detectionData.city);
            console.log('Region:', data.detectionData.region);
            console.log('Timezone:', data.detectionData.timezone);
            console.log('ISP:', data.detectionData.isp);
            
            console.log('\n--- Browser Configuration ---');
            console.log('User Agent:', data.detectionData.userAgent);
            console.log('Platform:', data.detectionData.platform);
            console.log('Vendor:', data.detectionData.vendor);
            console.log('Screen Resolution:', data.detectionData.screenRes);
            console.log('Color Depth:', data.detectionData.colorDepth);
            console.log('Hardware Cores:', data.detectionData.hardwareCores);
            console.log('Device Memory:', data.detectionData.deviceMemory);
            console.log('Battery Level:', data.detectionData.batteryLevel);
            
            console.log('\n--- Fingerprints ---');
            console.log('Canvas Hash:', data.detectionData.canvasHash);
            console.log('WebGL Vendor:', data.detectionData.webGLVendor);
            console.log('WebGL Renderer:', data.detectionData.webGLRenderer);
            console.log('Audio Hash:', data.detectionData.audioHash);
            console.log('Fonts Count:', data.detectionData.fontsCount);
            console.log('Plugins:', data.detectionData.plugins);
            
            // Log the full data if available
            if (data.detectionData.fullDataJSON) {
                console.log('\n--- Full Data JSON ---');
                try {
                    const fullData = JSON.parse(data.detectionData.fullDataJSON);
                    console.log('Total fields collected:', Object.keys(fullData).length);
                    console.log('Full data sample:', JSON.stringify(fullData).substring(0, 500) + '...');
                } catch (e) {
                    console.log('Could not parse full data JSON');
                }
            }
        }
        
        // Log backup data if this is a backup request
        if (data.type === 'browser_fingerprint_backup' && data.detectionData) {
            console.log('\n--- BACKUP DATA ---');
            
            if (data.detectionData.browserConfig) {
                console.log('Browser Config Fields:', Object.keys(data.detectionData.browserConfig).length);
                console.log('Sample Browser Config:', JSON.stringify(data.detectionData.browserConfig).substring(0, 300) + '...');
            }
            
            if (data.detectionData.fingerprints) {
                console.log('Fingerprint Types:', Object.keys(data.detectionData.fingerprints));
                if (data.detectionData.fingerprints.fonts) {
                    console.log('Detected Fonts:', data.detectionData.fingerprints.fonts.length);
                }
                if (data.detectionData.fingerprints.webGLExtensions) {
                    console.log('WebGL Extensions:', data.detectionData.fingerprints.webGLExtensions.length);
                }
            }
            
            if (data.detectionData.geoData) {
                console.log('Geo Data Available:', Object.keys(data.detectionData.geoData).length > 0);
            }
        }
        
        // Log encrypted string if available
        if (data.encryptedString) {
            console.log('\n--- Encrypted String ---');
            console.log('Length:', data.encryptedString.length);
            // Log the COMPLETE encrypted string
            console.log('Full encrypted string:', data.encryptedString);
        }
        
        console.log('\n=== END OF FINGERPRINT DATA ===\n');
        
        // Here you would typically save to a database
        // For now, we'll just log and return success
        
        // Example database save (uncomment and modify for your database):
        /*
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('fingerprints');
        const collection = db.collection('browser_data');
        await collection.insertOne({
            ...data,
            serverTimestamp: new Date(),
            ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        });
        await client.close();
        */
        
        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Browser fingerprint data logged successfully',
            timestamp: new Date().toISOString(),
            dataReceived: {
                type: data.type,
                fieldsCount: data.detectionData ? Object.keys(data.detectionData).length : 0,
                hasEncryptedString: !!data.encryptedString,
                hasMetadata: !!data.metadata
            }
        });
        
    } catch (error) {
        console.error('Error processing fingerprint data:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to process fingerprint data',
            message: error.message
        });
    }
}