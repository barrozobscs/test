const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors()); // This allows your HTML file to talk to this backend
app.use(express.json());

// Serve static files (like HTML) from the current directory
app.use(express.static(path.join(__dirname)));

app.post('/create-checkout', async (req, res) => {
    // SECURITY: The secret key stays hidden on the server
    const secretKey = 'sk_test_k3YusJXg6CrYoC9FaHGC9rhn'; // Replace with your actual PayMongo TEST Secret Key
    const encodedKey = Buffer.from(secretKey + ':').toString('base64');

    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            authorization: `Basic ${encodedKey}`
        },
        body: JSON.stringify({
            data: {
                attributes: {
                    billing: {
                        name: req.body.name,
                        email: req.body.email,
                    },
                    line_items: [
                        {
                            currency: "PHP",
                            amount: 5000, 
                            description: "Standard blue gallon refill",
                            name: "20-Liter Purified Water Refill",
                            quantity: 5
                        }
                    ],
                    payment_method_types: ["card", "gcash", "paymaya"], 
                    success_url: "https://ten-readers-bow.loca.lt/success.html", 
                    cancel_url: "https://ten-readers-bow.loca.lt/cancel.html"
                }
            }
        })
    };

    try {
        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', options);
        const jsonResponse = await response.json();
        
        // Send the URL back to the frontend
        if (jsonResponse.data && jsonResponse.data.attributes.checkout_url) {
            res.json({ url: jsonResponse.data.attributes.checkout_url });
        } else {
            res.status(400).json({ error: jsonResponse });
        }
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));