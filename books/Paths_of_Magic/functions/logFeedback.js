const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using environment variables
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Convert \n to actual newlines
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    })
});

const db = admin.firestore();

exports.handler = async (event) => {
    try {
        // Parse the feedback data from the request body
        const feedbackData = JSON.parse(event.body);

        // Check if feedbackData is an array
        if (!Array.isArray(feedbackData)) {
            throw new Error("Parsed feedback data is not a valid array of objects");
        }

        // Log the type and structure of the data
        console.log("Type of feedbackData:", typeof feedbackData);
        console.log("Feedback data structure:", feedbackData);

        // Iterate over each item in the feedbackData array and add to Firestore
        for (const feedback of feedbackData) {
            if (typeof feedback === 'object' && feedback !== null) {
                await db.collection('feedback').add(feedback);
                console.log('Feedback saved:', feedback);
            } else {
                console.warn('Invalid feedback object skipped:', feedback);
            }
        }

        // Respond with a success message
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Feedback logged and saved to Firestore successfully!' })
        };
    } catch (error) {
        console.error('Error logging or saving feedback:', error);

        // Respond with an error message
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to log and save feedback.' })
        };
    }
};
