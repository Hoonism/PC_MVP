You are an expert project planner. Your task is to generate a comprehensive project plan for a new web application.
Application Name: "JourneyBook" (or similar)
Core Concept: The application allows users to create a personalized digital storybook by uploading their own photos and text files. The application's primary focus is documenting a pregnancy journey. A key feature is the ability to select a narrative "tone," which the application will use to automatically weave the user's content into a cohesive story.
Instructions:
Generate a complete project plan based on the concept above. The plan must be structured into five distinct phases. For each phase, provide detailed action items, specifications, and suggested timelines.

Phase 1: Foundation and Planning (Timeline: 2 Weeks)
Define Core Project Details:
Project Mission: To create a web application that helps expectant parents easily document and cherish their pregnancy journey in a beautifully narrated digital storybook.
Target Audience: Expecting parents, new parents, and their families.
Specify Minimum Viable Product (MVP) Features:
User Authentication: Secure registration and login system.
Project Management: Ability for users to create, save, and manage their storybook projects.
File Uploader: An interface that accepts image files (.jpg, .png) and text files (.txt).
Storybook Editor: A simple, visual editor with drag-and-drop functionality for arranging photos and text chronologically. Users must be able to add short captions to images.
Tone Selection Engine: A user interface where users select one of several predefined narrative tones.
Preview Functionality: A screen that displays a real-time preview of the generated storybook.
Export Feature: A function to generate and download the final storybook as a PDF file.
Detail the Tone and Narrative Instructions: This is the core intellectual property of the application. For each of the following tones, provide instructions on how the application should process and present the user's content.
Tone 1: "Sweet and Sentimental"
Narrative Style: Use words of love, wonder, and anticipation.
Example Phrases: "Our dearest little one," "We couldn't wait to meet you," "Our hearts were filled with so much joy."
Logic: Frame user-provided text within an emotional context. For an ultrasound photo, the generated text might be, "The first time we saw you was pure magic..."
Tone 2: "Humorous and Honest"
Narrative Style: Use lighthearted, witty, and playful language.
Example Phrases: "Well, the pregnancy cravings officially got weird today...", "Here's proof that your mom was an absolute superhero."
Logic: Focus on the quirky and funny moments described in user text files.
Tone 3: "Journalistic and Milestone-Focused"
Narrative Style: Factual, clear, and chronological.
Example Phrases: "Week 12: First Ultrasound," "On [Date], we found out you were on the way," "Key Development: First kicks felt."
Logic: Use dates from file metadata or user input to structure the story as a timeline.
Tone 4: "Poetic and Reflective"
Narrative Style: Metaphorical, descriptive, and artistic.
Example Phrases: "A new chapter began to unfold," "A tiny spark, a universe of love."
Logic: Use more abstract and expressive language to connect the user's photos and notes.

Phase 2: Design and Prototyping (Timeline: 2 Weeks)
Outline the User Experience (UX) and User Interface (UI) Design Process:
Wireframing: Create low-fidelity layouts for all application screens.
Mockups: Develop high-fidelity visual designs.
Color Palette: Specify a soft, calming color scheme (e.g., pastels, muted earth tones).
Typography: Select fonts that are warm, friendly, and highly readable.
Prototyping: Build a clickable prototype to simulate the user flow from registration to final download.

Phase 3: Development (Timeline: 6 Weeks)
Specify the Technology Stack:
Frontend: Tailwind CSS & next.js
Backend: Node.js with Express or Python with Django
Database: PostgreSQL or MongoDB
File Storage: Amazon S3 or Google Cloud Storage
PDF Generation Library: PDFKit (for Node.js) or ReportLab (for Python)
Structure the Development into Sprints:
Sprint 1 (Weeks 1-2): Backend setup, including database schema, user authentication API, and file storage integration.
Sprint 2 (Weeks 3-4): Frontend development for user registration, login, project dashboard, and the file upload interface.
Sprint 3 (Weeks 5-6): Build the core Storybook Editor, including drag-and-drop functionality, the tone selection engine, and the final PDF generation logic.
Let’s first generate the text content, using Gemini 2.5 pro as the text generator. 

