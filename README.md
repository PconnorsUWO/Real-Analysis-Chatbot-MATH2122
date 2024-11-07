
# Real-Analysis-Chatbot-MATH2122

## Description

**Real-Analysis-Chatbot-MATH2122** is a chatbot designed to assist second-year university students studying Real Analysis. Built upon the course textbook, this chatbot helps clarify concepts, answer questions, and provide explanations related to the subject matter. The dataset for training was created using LangChain to facilitate a better understanding of Real Analysis topics.

- Check out this video to see my project in action:

[![Watch the video](https://img.youtube.com/vi/5kboq6OiIRI/maxresdefault.jpg)](https://www.youtube.com/watch?v=5kboq6OiIRI)

### Features

- Interactive chatbot for Real Analysis MATH 2122
- Utilizes OpenAI's GPT-based models for natural language understanding
- Dataset creation powered by LangChain
- Web interface built with Next.js
- API Calls from frontend handled with flask
- Supports mathematical notation rendering with KaTeX
- Modular UI components using shadcn
- Uses scipy to compare textbook embeds to prompt embed

---

## Installation

### Prerequisites

- Python 3.8 or higher
- Next.js and npm
- An OpenAI API key
- Requirements.txt
  
### Steps

#### Clone the repository

```bash
git clone https://github.com/yourusername/Real-Analysis-Chatbot-MATH2122.git
cd Real-Analysis-Chatbot-MATH2122
```



#### Install Python dependencies

```bash
pip install -r requirements.txt
```

The `requirements.txt` includes:

- `pdfminer.six==20221105`
- `PyPDF2==3.0.1`
- `openai==0.27.0`
- `tqdm==4.65.0`
- `flask==2.0.1`
- `python-dotenv==0.19.1`

#### Set up environment variables

Go to the .env file in the backend directory and set the OPEN_API_KEY to yours

```bash
OPENAI_API_KEY=your_openai_api_key
```

#### Install Node.js dependencies

```bash
# Add shadcn UI components
npx shadcn@latest add button input scroll-area sidebar

# Install additional packages
npm install katex @types/katex lucide-react
```

---

## Usage

### Run the Flask and Next.js project

```bash
cd frontend
python ../app.py
npx next dev
```

### Access the web interface

Open your web browser and navigate to [http://localhost:3000](http://localhost:3000)

Interact with the chatbot using the web interface to ask questions related to the Textbook!

Live Hosting [Math2122chatbot.com](http://Math2122chatbot.com)

### Notes

 - Want to add a SQL database for users so the bot has a memory of the last chat
 - Also possibly add other textbooks so I can recommend a variety of problems with solutions from multiple sources
 - If you want this to be made for your class reach out, all that would change is the dataset.
