# About This Project
The WebPerceptor is a client-side Chromium plugin which, for any web page, identifies text content, relays this to a local or cloud-based LLM with a given user-defined prompt, then automatically replaces the identified text with the LLM response. By doing this in real-time and seamlessly presenting the results in-browser, the end result is that users perceive the modified page content as if it were the originally published content. 

The WebPerceptor is designed to enable the automatic, personalised, in-line, real-time remixing of web browsing, allowing users to browse a client-side, user-controlled "AI Mediated Web". 

# Getting Started 
This section is intended for developers and individuals with some experience using custom Chromium plugins and code. 

A set of non-technical setup instructions (and walkthrough video) is provided in the **Getting Started (Guided Walkthrough)** section below. 

Please read `license.md`, `legal_notice.md`, and `responsible_use.md` before using the WebPerceptor tool.

### Prerequisites
A Chromimum browser is required for use. 

To use the WebPercetor's cloud-based LLM functionality requires an account, API key, and credit with an LLM provider, e.g. OpenAI, xAI, etc. 

To use the WebPerceptor's local LLM functionality requires:
* [``Nodejs``](https://nodejs.org/en)
* [``npm``](https://www.npmjs.com/) (typically installed alongwith Nodejs) 
* [``Ollama``](https://ollama.com/download/)

### Installation
Steps 1-4 download and setup the plugin for use within the browser. Step 5 installs the node modules necessary to run WebPerceptor's local LLM mode. 
1. Clone the repo (or download and unzip it)
```sh
git clone https://github.com/theartofhci/WebPerceptor.git
```
2. In your browser go to 
```sh
chrome://extensions/
```
3. Enable **Developer Mode**
4. Click **"load unpacked"** and select the folder which contains the ``manifest.json``
5. *(Optional: If you want to use the plugin with a local LLM)* In the ``main`` project folder run ``npm install``


### Cloud-Based LLM Setup
1. Setup an account, API key, and credit with a supported cloud-based LLM provider
2. In the configurations options, enter the **name of the model** you want to use in the ``Cloud-based LLM Model`` text box and your **API key** in the ``Cloud-based LLM API Key`` text box


WebPerceptor currently supports:
* OpenAI
* xAI 

### Local LLM Setup
**Installation:**
1. Check you have [Ollama](https://ollama.com/download/) and a [model](https://ollama.com/search) installed 
2. Check you have [Nodejs](https://nodejs.org/en) and [npm](https://www.npmjs.com/) installed
3. If you have not done so already, in the ``main`` project folder run ``npm install``
   
**Running With a Local LLM:**
1. In the configurations options, enable the ``Use Local LLM`` toggle and enter the **name of the Ollama model** you want to use in the ``Ollama Model`` text box 
2. Open a new terminal / command line window and run Ollama using
```sh
ollama serve
```
3. Open a new terminal / command line window, navigate to the project directory, and run
```sh
node server.js
```

# Getting Started (Guided Walkthrough)
Coming soon...


# Functionality and Usage 
An overview of the functionality and usage coming soon...


# Contributing
Coming soon...


# Built With
- HTML, CSS, and JavaScript
- Ollama and Nodejs (local LLM support) 
