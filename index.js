const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const puppeteer = require('puppeteer');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));



const genAI = new GoogleGenerativeAI("AIzaSyD2A8QgCP_49fB54DrJMJk8fawwZPBphQQ");

async function extractQuestionsFromForm(formLink) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.goto(formLink);

  const questionElements = await page.$$eval('.z12JJ', (elements) => {
    return elements.map((element) => {
      const questionText = element.querySelector('.M4DNQ').textContent;
      return questionText;
    });
  });

  await browser.close();
  return questionElements;
}

async function getAnswerFromGemini(question) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(question);
  const response = await result.response;
  return response.text();
  }



app.post('/process-form', async (req, res) => {
  try {
    const formLink = req.body.formLink;
    const questions = await extractQuestionsFromForm(formLink);
    
    const results = [];
    for (const question of questions) {
      const answer = await getAnswerFromGemini(question);
      results.push(`Question: ${question}\n\nAnswer: ${answer}`);
    }

    res.json({ results });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing the form.' });
  }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});