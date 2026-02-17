# Overview
The WebPerceptor is a client-side Chromium plugin which, for any web page, identifies text content, relays this to a local or cloud-based LLM with a given user-defined prompt, then automatically replaces the identified text with the LLM response. By doing this in real-time and seamlessly presenting the results in-browser, the end result is that users perceive the modified page content as if it were the originally published content. 

The WebPerceptor is designed to enable the automatic, personalised, in-line, real-time remixing of web browsing, allowing users to browse a client-side, user-controlled "AI Mediated Web". 

_In short, and in less technical jargon, what if when you open a web page all of the text is just automatically sent to and rewritten by an LLM with some prompt and then automatically re-inserted into the web page as it loads? As the user all you've done is open a web page. But in reality the content has been completely rewritten by an LLM._

### Envisioned Use Cases 
There are many potential benefits to an AI mediated web including: 
- **Comprehension:** adapting content to specific reading level, a target text length, a particular style guide, to make personalized accommodations to create a more generally cognitively accessible web, etc 
- **Engagement:** altering content in terms of tone, sentiment, emotional resonance, etc 
- **Factuality:** providing in-line fact checking, highlight (and possible rewriting) bias, etc
- **Representation:** incorporating different positions where limited voices and perspectives are presented, etc 
- **Safety:** censoring triggers or otherwise adapting content to be safer for vulnerable groups, etc 
- **Search:** highlighting pertinent information related to the overall search query or known topics of interest, or otherwise remove, diminish, filter or sort less relevant information, etc
- **And more**

However, there are many potential harms as well, e.g. 
- **Bias:** rewriting content to add or be tailored towards a particular bias/viewpoint, etc 
- **Censorship:** distressing content could be rewritten to be more positive or hidden from view entirely, historical information could be rewritten inaccurately, etc 
- **Information Disorder:** political parties or malicious actors could control the wording/framing/content perceived by supportors, exacerbating echo chambers; re-writing material as an attack on the author or subjects character or credibility, etc
- **Extremism:** amplifying narratives to widen the spread of false narratives, extremist views, and political viewpoints, dehumanizing groups or
demographics when discussed by removing references or rewording sympathetic views, etc 
- **And more**


# Getting Started 
This section is intended for developers and individuals with some experience using custom Chromium plugins and code. 

A set of non-technical setup instructions (and walkthrough video) is provided in the **Getting Started (Guided Walkthrough)** section below. 

> [!CAUTION]
> - Read `license.md`, `legal_notice.md`, and `responsible_use.md` before using the WebPerceptor tool.
> - Use of a cloud-based model requires API credits at your own financial costs 


## Prerequisites
Todo: A Chromimum browser is required for use. -- revise this part 
> [!NOTE]
> Todo: Information here about the testing and readme instructions have been setup using Google Chrome. While it works on Firefox and other Chromium browsers there may be some differences


To use the WebPerceptor's cloud-based LLM functionality requires an account, API key, and credit with an LLM provider, e.g. OpenAI, xAI, etc. 

To use the WebPerceptor's local LLM functionality requires:
* [``Nodejs``](https://nodejs.org/en)
* [``npm``](https://www.npmjs.com/) (typically installed alongwith Nodejs) 
* [``Ollama``](https://ollama.com/download/)

## Installation
Steps 1-4 download and setup the plugin for use within the browser. Step 5 installs the node modules necessary to run WebPerceptor's local LLM mode. 
1. Clone the repo (or download and unzip it). Step 6 pins the plugin to the browser toolbar for easy access to the settings page during use. 
```sh
git clone https://github.com/theartofhci/WebPerceptor.git
```
2. In your browser go to 
```sh
chrome://extensions/
```
3. Enable **Developer Mode**
4. Click **"load unpacked"** and select the ``src`` folder (the main folder which contains the ``manifest.json`` and source code)
5. *(Optional: If you want to use the plugin with a local LLM)* In the ``src`` project folder run ``npm install``
6. *(Optional: For easy access during use)* To pin the plugin to your toolbar, click the Extensions icon (the puzzle piece icon in the top-right of the browser window). Click the Pin icon next to the WebPerceptor's name. 


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

## Model Recommendations
A user's choice of model will influence their experienced processing speeds during use as well as the quality of any generated output. At present, as the models and WebPerceptor continue to develop, there is a trade-off between processing speeds and generated content quality. Note: additional factors impacting processing speeds also include the user's hardware (when running a local model) as well as the amount of content being processed on a given page. 

During testing and demonstrations the following models are typically used: 
- Cloud-based (OpenAI): ``gpt-3.5-turbo``
- Local: ``qwen2.5:0.5b``
- Local: ``gemma3:1b``

These have (``gpt-3.5-turbo`` and ``qwen2.5:0.5b`` in particular) fast processing speeds on a 2025 Macbook Air across most webpages, providing a sense of the achievability of an AI mediated web in the near future.

As an example using ``gpt-3.5-turbo`` during early benchmark tests: 
- All content on BBC News articles is modified and rendered in under 2.5 seconds 
- All content when scrolling on X.com is modified and rendered in under 2 seconds 
- All content on Wikipedia articles ranging from 115 to 19,000 words is modified and rendered in 1-9 seconds 

Please note a more comprehensive benchmarking test of the WebPerceptor is underway and future improvements to the efficiency of the content processing pipeline are planned. 

## Walkthrough of an Example Use:
TODO: Walkthrough instructions for re-writing a Wikipedia article. Give some other suggested websites to try it on as well BBC News, X.com, Reddit, or well, any website.


# Getting Started (Guided Walkthrough)
Coming soon... This is just a video of the above Getting Started section - it could just be a sub section of the above just entitled "Video Walkthrough" 



# Functionality 
### Cloud-Based/Local Model Support 
WebPerceptor supports cloud-based and local LLM models. 

Using a local LLM, query requests and content are sent to a locally hosted LLM (i.e. an Ollama served model with a lightweight Node.js API wrapper). This ensures privacy during use, is free to use, and allows the use of personalised, custom models, albeit often with some performance costs depending on user hardware. 

Using a cloud-based model, query requests are sent to a cloud-based LLM along with the user's API key. This enables use on systems not capable of running local models and typically provides the most performant experience for users, albeit at the finanical cost of using these services. 

### Text Modification
WebPerceptor supports two modes of text modification:
- **Rewriting:** original content is replaced entirely with a version generated by the LLM
- **Appending:** original content remains unchanged with the LLM's output added after it

For example, if the WebPerceptor was used to translate text into another language, in the rewriting mode the original text would be replaced by the translated text, while in the appending mode both the original and translated text would appear. 

Both by default use a transparent modification where during processing targeted content is reduced in opacity until processed when their opacity is restored. Although this visual effect can be overridden, i.e. to hide content completely from view until processed. 

### Targeted Modification
WebPerceptor has a flexible page filter system which allows users, if desired, to specify which domains/webpages should be processed. This allows users to specify specific URLs or URL patterns for inclusion or exclusion from processing, providing a more controlled web mediation experience. 

WebPerceptor’s content filtering system allows users to specify which HTML tag types (e.g. navigation bars, paragraphs, headers, tables, buttons, etc) should be included/excluded from processing. During DOM traversal, any text contained within specified tags (or their descendants) is automatically processed/skipped depending on the set configuration. 

### Page Specific Functionality
WebPerceptor’s architecture allows for the creation of site-specific processing approaches. These modules override the generic modification processing used, allowing for
a pipeline tailoured to the specific structure and behaviour of the target website. E.g., custom logic can be to target site-specific features/components, content-filtering presets can be established, a site-specific text element identification can be implemented, etc

# Built With
- HTML, CSS, and JavaScript
- Ollama and Nodejs (local LLM support)
  
# Contributing
Coming soon...

# Feedback and Suggestions
If you would like to submit feedback, request a new feature or change, or report a bug or error you experienced: [click here](https://uofg.qualtrics.com/jfe/form/SV_782STWBUrHaBiXI)

Alternatively, please feel free to use any of GitHub's built-in functionality to do this. 

# Research Collaborations
If you are interested in collaborating on future research projects feel free to send a message by [clicking here](https://uofg.qualtrics.com/jfe/form/SV_0p6lLI0GSzAi0nQ)

# Citation  
How to cite the WebPercepor repository here. A link to any arxiv paper (depending on reviews what that is) and a citable reference here as well for that. 
