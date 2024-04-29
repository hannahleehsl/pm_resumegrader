const express = require('express');
require('dotenv').config();
const { openai } = require("./routes/gptService");
const app = express();
const port = process.env.PORT || 3000;
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.get("/", async (req, res) => {
    res.render("resumeGrader");
});

app.use('/pdfs', express.static('uploads'));

app.post("/grade-resume", async (req, res) => {
    try {
        const textContent = req.body.text;
        const prompt = `Summarize the text: \n\n${textContent}`;
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "system",
                content: "You "
            },{
                role: "user",
                content: prompt,
            }],
        });

        const gptText = response.choices[0].message.content;
        console.log(gptText);
        res.json({ htmlContent: gptText });
    } catch (error) {
        console.error("Error grading resume:", error);
        res.status(500).json({ error: 'Failed to grade resume' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;