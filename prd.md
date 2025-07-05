# Arboracle: Product Requirements Document (PRD)

**Version:** 3.0 (Post-Crash System Restore & Hardening)  
**Date:** July 5, 2025  
**Status:** **MASTER DOCUMENT - SINGLE SOURCE OF TRUTH**

## 1. The Vision & Guiding Philosophy

### 1.1. Our Manifesto: The Future of Eco-Intelligence
Arboracle is the nervous system for a new era of ecological stewardship. Its destiny is to become a decentralized swarm of intelligent AI agents—a true partner for every professional managing our planet's green spaces. The future of Arboracle is voice-first, AI-driven, and seamlessly integrated into the workflows of those on the ground. Every feature, every line of code, must serve this singular vision.

### 1.2. The Design Ethos: Nature-Aligned Wisdom
We reject sterile interfaces. Our aesthetic is **"super smooth and full of nature-aligned wisdom."**

*   **Organic & Fluid:** Embrace gentle curves, soft gradients, and flowing transitions.
*   **Sophisticated & Trustworthy:** Use a muted, earthy color palette and clean, professional typography.
*   **Subtle Dynamism:** Incorporate micro-animations that mimic natural phenomena (gentle sways, soft blooms).

## 2. Target Audience & User Personas

1.  **The Professional Field Arborist:** Manages urban/commercial trees. Values efficiency, standardized data, and professional reporting.
2.  **The Construction Site Monitor:** A specialized arborist needing structured, repeatable checklists for compliance reporting.
3.  **The Forestry Student / Certification Candidate:** Needs a platform that connects academic knowledge with real-world application.
4.  **The Nursery Owner:** Manages tree inventory and requires a direct sales/quoting channel to forestry professionals.

## 3. Core Functional Requirements (Current Sprint)

### **P0 - Critical Path: Platform Stability & Core Functionality Restoration**
*(These items are blockers and must be addressed before any new features are built. The platform is currently in a broken state.)*

| ID  | Module         | Requirement                                                                                                                                                             | Transcript Justification                                                                                             |
| --- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| P0-01 | **UI/UX**        | **Fix Responsive Layout:** Resolve all mobile view issues where text overflows its container (e.g., "Add Tree" button) and where content is cut off on the screen side. | *"messy, actually. On mobile... text within the buttons are routed... partly not showing"*                          |
| P0-02 | **Knowledge**    | **Repair the Knowledge & Learning Section:** This entire module is non-functional ("loading and airs out"). It must be fully repaired. It contains the study guide.      | *"knowledge sections are not functioning at all... you definitely need to address that and fix it"*                 |
| P0-03 | **Navigation**   | **Consolidate Navigation:** Remove the separate "Learn" tab from the main navigation. Its content (the Arborist Exam Study Guide) is part of the "Knowledge" section. | *"really do away with the learn section as it's contained within the knowledge portion"*                              |
| P0-04 | **Admin**        | **Admin Panel Tree Management:** Fix the Tree Management list view within the Admin panel so it correctly displays all trees in the inventory with detailed data.      | *"tree management is very basic. I don't have any trees in there right now, but it should show a lot more Data"*       |
| P0-05 | **Tree Display** | **Implement Full Taxonomic Breakdown:** Display the complete scientific classification hierarchy (Kingdom, Phylum, Class, Order, Family, Genus, Species) for each tree. | *"still not showing full taxonomic breakdown, which that was a previous request"*                                     |

### **P1 - High Priority: Restoring Professional Workflows & UI Integrity**
*(These items are essential regressions or core features that define the professional value of Arboracle.)*

| ID  | Module         | Requirement                                                                                                                                                                                             | Transcript Justification                                                                                                 |
| --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| P1-01 | **Tree Form**    | **Restore the "Checklist + Notes" Assessment UI:** The "Condition Assessment" must revert to the checklist format where clicking an item (e.g., "Soil Compaction") reveals a text box beneath it for notes. | *"condition assessment used to be a list... clicked one of the list items, it showed a text block underneath... I'd like to see that comeback"* |
| P1-02 | **AI / Tree Form** | **Restore Dynamic AI Persona Insights:** Re-implement the "Willow Knows," "Bodhi Knows," etc., cards that appear dynamically below the assessment section based on the user's checklist selections. | *"AI information from the various personas, Willow, nose... populated down below... I'd like to see that comeback"*         |
| P1-03 | **AI / Config**  | **Restore Full Suite of AI Personas:** The Config settings must show the complete set of AI personas as defined in the master brand document. Correct any mismatches (e.g., "Cypress and secoia are mismatched"). | *"only 3 personas in their... I had a full sweet of personas... let's get those assistance back in there"*         |
| P1-04 | **Tree Form**    | **Implement Correct Multi-Stem DBH Calculation:** The formula must be updated. It is: **(DBH of the largest stem) + (1/2 * DBH of each remaining stem over 3 inches)**. This is not the `sqrt(d1²+d2²)` formula. | *"entire dv H of the first larger stem would be calculated along with half the dv of the remaining stems."*                |
| P1-05 | **Tree Form**    | **Fix Photo Upload Visibility:** Uploaded images must be displayed as visible thumbnails in the form, not hidden behind the "Tap camera..." instruction text. | *"pictures, but then they're hidden behind a... text that's below the buttons there"*                                 |
| P1-06 | **Admin/Config** | **Expand Settings:** The "Settings" page is too basic. It needs to be expanded to include User Profile Settings and Project Management settings. | *"settings need to be A lot more. Advanced. They're very basic... User settings, you need to come back project management settings."* |

### **P2 - Medium Priority: Feature Refinements & Advanced Capabilities**
*(These items enhance usability and align the platform with its long-term vision.)*

| ID  | Module         | Requirement                                                                                                                                                                                   | Transcript Justification                                                                                               |
| --- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| P2-01 | **Maps**         | **Implement Map Layer Controls & Markers:** All map instances (main view and "Pick on Map") must have functional Satellite View controls and display markers for all trees.                    | *"does not have satellite view... does not have markers for the trees showing anywhere... no markers again on the Google Map"* |
| P2-02 | **Maps**         | **Implement True Full-Screen Map Mode:** Clicking the "Full Screen" or "View Larger Map" buttons must open a true full-screen MODAL within the application, not just remove header text or link externally. | *"not in actual full screen... does not actually open up a larger map... within the screen. And that's something that I wanted to happen"* |
| P2-03 | **Location Data**| **Correct Plus Code Links:** The generated Google Plus Codes must link to the `plus.codes` website with the code as a parameter, not to Google Maps. | *"wanted those to go to the actual plus duck codes website"*                                                           |
| P2-04 | **Location Data**| **Add Google Earth Integration:** Next to the coordinates link, add a small "Earth" icon that links to the location in Google Earth.                                                       | *"could also add in a Google Earth option there off to the side"*                                                      |
| P2-05 | **Admin**        | **Enhance Admin Systems Panel:** The "System" tab in the Admin Panel should be made more advanced with meaningful statistics and real-time activity logs.                                        | *"shows some example systems statistics... these definitely need to be addressed and made more advanced"*              |
| P2-06 | **Data Display** | **Show Ecosystem Data on Tree Detail View:** Information added in the "Ecosystem" management section must be visible on the main Tree Detail page for that tree.                              | *"ecosystem portion, they're being added, but a lot of that information is not being shown within the tree information"*    |

## 4. Vision for the "Swarm of AI Agents" Phase

While not in the immediate sprint, all development must pave the way for this future state. Keep these principles in mind:

*   **Inter-Agent Communication:** The personas/agents (Bodhi, Sequoia, etc.) will eventually need to communicate with each other, sharing insights to provide a more holistic recommendation.
*   **Cross-Training:** Over time, agents will become "cross-trained" in all knowledge domains, though they will retain their primary specializations and communication styles.
*   **Decentralized Intelligence:** The end goal is for users to interact with a seemingly single, powerful AI that is, in reality, a swarm of specialized agents working in concert. Our modular, API-first architecture is the key to achieving this.

This document serves as the **unambiguous roadmap** to restore Arboracle to its intended professional state and propel it toward its revolutionary future. Every task is directly tied to observed issues and strategic goals. Let's rebuild with precision and purpose.
