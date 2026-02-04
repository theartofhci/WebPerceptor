# About This Project
The WebPerceptor is a client-side Chromium plugin which, for any web page, identifies text content, relays this to a local or cloud-based LLM with a given user-defined prompt, then automatically replaces the identified text with the LLM response. By doing this in real-time and seamlessly presenting the results in-browser, the end result is that users perceive the modified page content as if it were the originally published content. 

The WebPerceptor is designed to enable the automatic, personalised, in-line, real-time remixing of web browsing, allowing users to browse a client-side, user-controlled "AI Mediated Web". 

# Getting Started 
This section is intended for developers and individuals with some experience using custom Chromium plugins and code. 

A set of non-technical setup instructions (and walkthrough video) is provided in the **Getting Started (Guided Walkthrough)** section below. 

Please read `license.md`, `legal_notice.md`, and `responsible_use.md` before using the WebPerceptor tool.

A set of non-technical installation instructions (and walkthrough video) 

### Prerequisites
A Chromimum browser is required for use. 

To use the WebPercetor's cloud-based LLM functionality requires an account, API key, and credit with an LLM provider, e.g. OpenAI, xAI, etc. 

To use the WebPerceptor's local LLM functionality requires:
* ``npm``
* ``ollama``

### Installation
Steps 1-4 install download and setup the plugin for use within the broswer. Step 5 installs the node modules used to run the local LLM. 
1. Clone the repo
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
2. In the LLM setup of the settings page enter the name of model to use 
3. In the LLM setup of the settings page enter your API key to use

WebPerceptor currently supports models by
* OpenAI
* xAI 

### Local LLM Setup
Coming soon...


# Getting Started (Guided Walkthrough)
Coming soon...


# Functionality and Usage 
An overview of the functionality and usage coming soon...


# Built With
- HTML, CSS, and JavaScript
- Ollama and Nodejs (local LLM support) 
- Geese (soundtrack) 
- Pizza and Irn-Bru ZERO
