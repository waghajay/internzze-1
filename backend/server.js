require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors());

const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseURL, supabaseKey);


// Initialize razorpay 
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);


const validReferralCodes = ["REF100", "SAVE99", "DISCOUNT50", "OFFER2024" , "DIKE9284","ANSH100","KARTIK100","MANISHA100","NIRAJ100","VARAD100","PRANAV100","RUSHIKESH100","SHIVAM100"];

app.post("/register", async (req, res) => {
    const { name, email, number, college, linkedin, github, program, description, referral } = req.body;

    try {
        
        let price = 499;

        


        if (referral && validReferralCodes.includes(referral)) {
            if (price === 499) {
                price = 149;
            } else if (price === 399) {
                price = 99;
            }
        }

    
        const { data, error } = await supabase.from("users").insert([
            { 
                name, 
                email, 
                number, 
                college, 
                linkedin, 
                github, 
                program, 
                description, 
                referral, 
                price 
            }
        ]);

        if (error) throw error;

        return res.status(201).json({ message: "Registration Successful!", price, user: data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


app.put("/update-price", async (req, res) => {
    const { email, newPrice } = req.body;

    try {
       
        const { data: userData, error: fetchError } = await supabase
            .from("users")
            .select("price")
            .eq("email", email)
            .single();

        if (fetchError) throw fetchError;
        if (!userData) return res.status(404).json({ error: "User not found!" });

        let updatedPrice = userData.price;

        if (validReferralCodes.includes(req.body.referral)) {
            if (updatedPrice === 499) {
                updatedPrice = 99;
            } else if (updatedPrice === 399) {
                updatedPrice = 49;
            }
        }


        const { data, error } = await supabase
            .from("users")
            .update({ price: updatedPrice })
            .eq("email", email);

        if (error) throw error;

        return res.status(200).json({ message: "Price Updated Successfully!", updatedPrice });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});








app.post("/StartupRegister", async (req, res) => {
    const { name, email, number, college, linkedin, github, program, description, referral } = req.body;

    try {
        let price = 399;

        

        if (referral && validReferralCodes.includes(referral)) {
            if (price === 399) {
                price = 149;
            } else if (price === 499) {
                price = 99;
            }
        }

        const { data, error } = await supabase.from("users").insert([
            { 
                name, 
                email, 
                number, 
                college, 
                linkedin, 
                github, 
                program, 
                description, 
                referral, 
                price 
            }
        ]);

        if (error) throw error;

        return res.status(201).json({ message: "Registration Successful!", price, user: data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});









// Create Order
app.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }
        
        const options = {
            amount: amount, // Amount in paise (INR 499 * 100)
            currency: "INR",
            payment_capture: 1,
            receipt: `receipt_${Math.floor(Math.random() * 1000000)}`,
        };

        const order = await razorpay.orders.create(options);
        console.log("order created : ",order)
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Order creation failed", error });
    }
});

// Verify Payment
app.post("/verify-payment", (req, res) => {
    console.log("🔹 Received Payment Verification Request:", req.body);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log("✅ Payment ID (for capture):", razorpay_payment_id);  //

    const generated_signature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generated_signature === razorpay_signature) {
        res.json({ success: true, message: "Payment verified successfully" });
    } else {
        res.status(400).json({ success: false, message: "Payment verification failed" });
    }
});



app.get("/payment-callback", (req, res) => {
    console.log("Callback received:", req.query);
    res.redirect("http://localhost:your_frontend_port/success"); // Redirect back to your frontend
});


















// app.post("/capture-payment", async (req, res) => {
//     try {
//         const { payment_id, amount } = req.body;

//         console.log("🔹 Capturing Payment ID:", payment_id, "for amount:", amount);

//         if (!payment_id || !amount) {
//             return res.status(400).json({ success: false, message: "Missing payment ID or amount" });
//         }

//         // 🔹 Capture the payment
//         const captureResponse = await razorpay.payments.capture(payment_id, amount, "INR");

//         console.log("✅ Capture Response:", captureResponse);

//         res.json({ success: true, message: "Payment captured successfully", captureResponse });
//     } catch (error) {
//         console.error("⚠️ Payment Capture Error:", error);
//         res.status(500).json({ success: false, message: "Payment capture failed", error });
//     }
// });










app.get("/", (req, res) => {
    res.send("Hello, razorpay api is working");
});

app.listen(3000, () => {
    console.log("🚀 Server is running on port 3000");
});
